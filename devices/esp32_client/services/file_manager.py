import os
import asyncio
from config import USER_ROOT
from services.path_utils import safe_path

class Manager:

	def __init__(self, root=USER_ROOT):
		self.root = root.rstrip("/") or "/"
		if not self.exists(self.root):
			try:
				os.mkdir(self.root)
			except OSError:
				pass

	def _safe_path(self, path):
		return safe_path(path, self.root)

	def res_back(self, type, request_id, request_type, data, path, operation, stream = False):
		return {
			"type": type,
			"request_id": request_id,
			"request_type": request_type,
			"data": data,
			"path": path,
			"stream": stream,
			"operation": operation
		}

	async def file_operation(self, response, client):
		# print(response)
		type = response.get("type")
		operation = response.get("operation")
		request_id = response.get("request_id")
		request_type = response.get("request_type")
		raw_path = response.get("path") or "/"
		path = self._safe_path(raw_path)

		if operation == "list_folder":
			folders = await self.read_folder(raw_path)
			response_data = self.res_back(type, request_id, request_type, folders, raw_path, operation)
			await client.send_json(response_data)

		elif operation == "read_file":
			await self.read_file(response, client)

		elif operation == "write_file_start":
			open(path + ".tmp", "w").close()
			await client.send_json(self.res_back(type, request_id, request_type, "write_start ok", raw_path, operation))

		elif operation == "write_file":
			data = response.get("data")
			self.write_file(path, data)

		elif operation == "write_file_end":
			try:
				os.remove(path)
			except OSError:
				pass
			os.rename(path + ".tmp", path)
			await client.send_json(self.res_back(type, request_id, request_type, raw_path + " saved", raw_path, operation))

		elif operation == "create":
			entry_type = response.get("entry_type")
			created = self.create(path, entry_type)
			message = f"{raw_path} created" if created else f"{raw_path} already exists"
			await client.send_json(self.res_back(type, request_id, request_type, message, raw_path, operation))

		elif operation == "delete":
			entry_type = response.get("entry_type")
			message = self.delete(path, entry_type)
			await client.send_json(self.res_back(type, request_id, request_type, message, raw_path, operation))

	def delete(self, path, entry_type):
		try:
			if entry_type == "file":
				os.remove(path)
			elif entry_type == "folder":
				os.rmdir(path)
			else:
				return f"Unknown type: {entry_type}"
			return f"{path} deleted"
		except Exception as e:
			return str(e)

	def exists(self, path):
		try:
			os.stat(path)
			return True
		except OSError:
			return False

	def create(self, path, entry_type):
		if self.exists(path):
			return False
		if entry_type == "folder":
			os.mkdir(path)
		elif entry_type == "file":
			open(path, "x").close()
		else:
			raise Exception(f"Unknown type: {entry_type}")
		return True

	def write_file(self, path, data):
		with open(path + ".tmp", "a") as f:
			f.write(data)

	async def read_folder(self, path="/"):
		abs_path = self._safe_path(path)
		normalized = path or "/"
		entries = []
		for name, type_, *_ in os.ilistdir(abs_path):
			full_path = (normalized.rstrip("/") + "/" + name) if normalized != "/" else "/" + name
			entries.append({
				"name": name,
				"path": full_path,
				"type": "folder" if type_ == 0x4000 else "file",
			})
		return entries

	async def read_file(self, response, client):
		type = response.get("type")
		request_id = response.get("request_id")
		request_type = response.get("request_type")
		raw_path = response.get("path") or "/"
		operation = response.get("operation")
		abs_path = self._safe_path(raw_path)
		print("file manager ", abs_path)
		try:
			with open(abs_path, "r") as f:
				total_lines = 0
				for _ in f:
					total_lines += 1
				f.seek(0)
				await client.send_json({
					"type": type,
					"data": "",
					"request_id": request_id,
					"request_type": request_type,
					"path": raw_path,
					"stream": True,
					"operation": operation,
					"total_lines": total_lines
				})
				c = 0
				for line in f:
					await client.send_json({
						"type": type,
						"data": line,
						"request_id": request_id,
						"request_type": request_type,
						"path": raw_path,
						"stream": True,
						"operation": operation,
						"count": c
					})
					c+=1

			res = self.res_back(type, request_id, request_type, "", raw_path, operation, False)
			await client.send_json(res)

		except Exception as e:
			res = self.res_back("error", request_id, request_type, str(e), raw_path, operation, False)
			await client.send_json(res)