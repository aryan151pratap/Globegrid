import uasyncio as asyncio
from services.device_id import get_device_info
from services.file_manager import Manager
from services.runner_manager import runner_manager
from services.scanWifi import scan_wifi, get_wifi_status
from services.offline import _save
manager = Manager()

BOOT_COMMANDS = ("boot", "run", "stop", "restart", "list")

async def handleResponse(client, terminal, response):
	message_type = response.get("type")
	request_id = response.get("request_id")
	request_type = response.get("request_type")


	if message_type in ("command", "cancel"):
		raw = response.get("data", "")
		parts = raw.strip().split() if isinstance(raw, str) else []
		cmd = parts[0] if parts else None

		if message_type == "command" and cmd in BOOT_COMMANDS:
			if cmd in ("boot", "run"):
				filename = parts[1] if len(parts) > 1 else response.get("file")
				asyncio.create_task(runner_manager.run_file(filename, client))
			elif cmd == "stop":
				asyncio.create_task(runner_manager.stop())
			elif cmd == "restart":
				asyncio.create_task(runner_manager.restart(client))
			elif cmd == "list":
				asyncio.create_task(runner_manager._send_list())
		else:
			asyncio.create_task(
				terminal.handle_message(
					response,
					client.send_json
				)
			)

	elif message_type == "filesystem":
		await manager.file_operation(response, client)

	elif message_type == "details":
		device_info = get_device_info()
		await client.send_json({
			"type": "details",
			"request_id": request_id,
			"request_type": request_type,
			"data": device_info
		})

	elif message_type == "wifi":
		operation = response.get("operation")
		if operation == "scan":
			networks = scan_wifi()
			await client.send_json({
				"type": message_type,
				"request_id": request_id,
				"request_type": request_type,
				"networks": networks
			})
		elif operation == "status":
			data = get_wifi_status()
			await client.send_json({
				"type": message_type,
				"operation": operation,
				"request_id": request_id,
				"request_type": request_type,
				"status": data
			})
		elif operation == "save":
			data = response.get("data")
			print(data)
			ssid = data.get("ssid") if data else None
			pw = data.get("pass") if data else None

			if not ssid:
				await client.send_json({
					"type": message_type,
					"operation": operation,
					"request_id": request_id,
					"request_type": request_type,
					"message": "error: missing ssid"
				})
			else:
				try:
					_save(ssid, pw)
					msg = "saved"
				except Exception as e:
					print("save failed:", e)
					msg = "error: " + str(e)

				await client.send_json({
					"type": message_type,
					"operation": operation,
					"request_id": request_id,
					"request_type": request_type,
					"message": msg
				})