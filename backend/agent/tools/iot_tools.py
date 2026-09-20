import asyncio
import uuid

from fastapi import HTTPException
from langchain.tools import tool
from services.manager.device_manager import manager
from services.manager.agent_device_transport import agent_device_transport


class DeviceToolError(Exception):
	"""Raised when a device-side filesystem operation fails or times out."""
	pass


DEFAULT_TIMEOUT = 15      # seconds to wait for a normal (http) response
READ_TIMEOUT = 60         # read_file streams many messages, give it longer
WRITE_CHUNK_SIZE = 1024   # bytes per write_file chunk sent to device


def _new_request_id() -> str:
	return uuid.uuid4().hex


def _base_payload(operation: str, path: str, request_type: str = "http", msg_type: str = "filesystem", **extra) -> dict:
	payload = {
		"type": msg_type,
		"request_id": _new_request_id(),
		"request_type": request_type,
		"operation": operation,
		"path": path,
	}
	payload.update(extra)
	return payload


async def _send_and_wait(device_id: str, payload: dict, timeout: float = None):
	websocket = manager.get_websocket(device_id)
	if websocket is None:
		raise HTTPException(status_code=404, detail="device is not connected")

	request_id = payload["request_id"]
	future = manager.create_pending_request(request_id)

	try:
		await websocket.send_json(payload)
		result = await asyncio.wait_for(future, timeout=timeout or DEFAULT_TIMEOUT)
	except asyncio.TimeoutError:
		manager.cancel_request(request_id)
		raise DeviceToolError(
			f"Timed out waiting for device response to "
			f"'{payload.get('operation')}' on '{payload.get('path')}'"
		)
	except Exception:
		manager.cancel_request(request_id)
		raise

	if isinstance(result, dict) and result.get("type") == "error":
		raise DeviceToolError(result.get("data"))
	return result.get("data") if isinstance(result, dict) else result


async def _send_only(device_id: str, payload: dict):
	websocket = manager.get_websocket(device_id)
	if websocket is None:
		raise HTTPException(status_code=404, detail="device is not connected")
	await websocket.send_json(payload)


async def _send_and_wait_stream(device_id: str, payload: dict, timeout: float = None):
	websocket = manager.get_websocket(device_id)
	if not websocket:
		raise DeviceToolError(f"Device '{device_id}' is not connected")

	request_id = payload["request_id"]
	future = agent_device_transport.create_pending_request(request_id)
	try:
		await websocket.send_json(payload)
		result = await asyncio.wait_for(future, timeout or READ_TIMEOUT)
	except asyncio.TimeoutError:
		raise DeviceToolError(
			f"Timed out waiting for device response to "
			f"'{payload.get('operation')}' on '{payload.get('path')}'"
		)
	finally:
		agent_device_transport.cancel_request(request_id)

	lines = result.get("buffer", [])
	if result.get("data"):
		lines.append(result["data"])
	return "".join(lines)


def build_device_tools(device_id: str | None):
	"""
	Build the set of filesystem tools bound to one specific device.
	Call once per agent session with that session's device_id.
	"""

	if not device_id:
		return []

	@tool
	async def execute_file(path: str):
		"""Boot/execute a file on the IoT device at the given path."""
		payload = _base_payload("boot", path, data=f"boot {path}", msg_type="command")
		return await _send_and_wait(device_id, payload)

	@tool
	async def execute_file_terminal(path: str):
		"""Run a file on the IoT device via the terminal `run()` command."""
		payload = _base_payload("run", path, data=f"run('{path}')", msg_type="command")
		return await _send_and_wait(device_id, payload)

	@tool
	async def list_folder(path: str = "/") -> list:
		"""List files and folders on the IoT device at the given path."""
		payload = _base_payload("list_folder", path)
		return await _send_and_wait(device_id, payload)

	@tool
	async def read_file(path: str) -> str:
		"""Read and return the full text content of a file on the IoT device."""
		payload = _base_payload("read_file", path, request_type="agent")
		return await _send_and_wait_stream(device_id, payload, timeout=READ_TIMEOUT)

	@tool
	async def write_file(path: str, content: str) -> str:
		"""Create or overwrite a file on the IoT device with the given text content."""
		await _send_and_wait(device_id, _base_payload("write_file_start", path))

		for i in range(0, len(content), WRITE_CHUNK_SIZE):
			chunk = content[i:i + WRITE_CHUNK_SIZE]
			await _send_only(device_id, _base_payload("write_file", path, data=chunk))

		return await _send_and_wait(device_id, _base_payload("write_file_end", path))

	@tool
	async def create_entry(path: str, entry_type: str) -> str:
		"""Create a new empty file or folder on the IoT device. entry_type must be 'file' or 'folder'."""
		if entry_type not in ("file", "folder"):
			raise ValueError("entry_type must be 'file' or 'folder'")
		payload = _base_payload("create", path, entry_type=entry_type)
		return await _send_and_wait(device_id, payload)

	@tool
	async def delete_entry(path: str, entry_type: str) -> str:
		"""Delete a file or folder on the IoT device. entry_type must be 'file' or 'folder'."""
		if entry_type not in ("file", "folder"):
			raise ValueError("entry_type must be 'file' or 'folder'")
		payload = _base_payload("delete", path, entry_type=entry_type)
		return await _send_and_wait(device_id, payload)

	return [execute_file, execute_file_terminal, list_folder, read_file, write_file, create_entry, delete_entry,]