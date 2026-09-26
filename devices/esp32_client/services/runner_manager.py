import sys
import os
import uasyncio as asyncio
from services import device
from config import USER_ROOT
from services.path_utils import normalize_module_name

DEFAULT_MODULE = "runner"

if USER_ROOT not in sys.path:
    sys.path.append(USER_ROOT)


class RunnerManager:

    def __init__(self):
        self.task = None
        self.client = None
        self.current_module = None

    def _walk_py_files(self, root, rel=""):
        results = []
        try:
            entries = os.ilistdir(root)
        except (OSError, AttributeError):
            try:
                for name in os.listdir(root):
                    full = root + "/" + name
                    try:
                        mode = os.stat(full)[0]
                    except OSError:
                        continue
                    rel_path = (rel + "/" + name) if rel else name
                    if mode & 0x4000:  # dir
                        results.extend(self._walk_py_files(full, rel_path))
                    elif name.endswith(".py"):
                        results.append(rel_path[:-3])
            except OSError:
                pass
            return results
 
        for entry in entries:
            name, etype = entry[0], entry[1]
            full = root + "/" + name
            rel_path = (rel + "/" + name) if rel else name
            if etype & 0x4000:  # dir
                results.extend(self._walk_py_files(full, rel_path))
            elif name.endswith(".py"):
                results.append(rel_path[:-3])
        return results

    def _list_user_files(self):
        return self._walk_py_files(USER_ROOT)

    async def _send_output(self, message, level="error"):
        if not self.client:
            return
        try:
            await self.client.send_json({
                "type": "output",
                "level": level,
                "message": str(message),
                "module": self.current_module,
            })
        except Exception as e:
            print("Failed to send output:", e)

    async def _launch(self, module_name):
        module_name = normalize_module_name(module_name)
        if module_name not in self._list_user_files():
            msg = "file not found: " + module_name + ".py"
            print("Module not found in user folder:", module_name)
            await self._send_output(msg)
            return False

        try:
            device.init(self.client)
            print("module name ", module_name)
            for name in self._list_user_files():
                if name in sys.modules:
                    del sys.modules[name]
            mod = __import__(module_name)
            self.current_module = module_name
            self.task = asyncio.create_task(self._run(mod, module_name))
            print(module_name + ".py started")
            await self._send_output(module_name + ".py started", level="info")
            return True
        except Exception as e:
            print("Runner error:", e)
            self.current_module = module_name
            await self._send_output("Runner error: " + str(e))
            self.current_module = None
            return False

    async def _run(self, mod, module_name):
        try:
            await mod.main()
        except asyncio.CancelledError:
            raise
        except Exception as e:
            print(module_name, "crashed:", e)
            await self._send_output(module_name + " crashed: " + str(e))
            self.task = None
            self.current_module = None

    async def start(self, client, module_name=DEFAULT_MODULE):
        self.client = client
        if self.task and not self.task.done():
            return True
        return await self._launch(module_name)

    async def stop(self):
        if self.task and not self.task.done():
            self.task.cancel()
            await asyncio.sleep(0)  # let the cancellation actually land
        self.task = None
        stopped_module = self.current_module or DEFAULT_MODULE
        print(stopped_module + ".py stopped")
        await self._send_output(stopped_module + ".py stopped", level="info")
        self.current_module = None

    async def restart(self, client=None):
        await self.stop()
        return await self.start(client or self.client, DEFAULT_MODULE)

    async def run_file(self, filename, client=None):
        if not filename:
            await self._send_output("run: no filename provided")
            return False
        module_name = filename[:-3] if filename.endswith(".py") else filename
        await self.stop()
        return await self.start(client or self.client, module_name)

    def handle_message(self, data):
        action = data.get("action")

        if action == "run":
            asyncio.create_task(self.run_file(data.get("file")))
        elif action == "stop":
            asyncio.create_task(self.stop())
        elif action == "restart":
            asyncio.create_task(self.restart())
        elif action == "list":
            asyncio.create_task(self._send_list())
        else:
            device.set_message(data)

    async def _send_list(self):
        if not self.client:
            return
        try:
            await self.client.send_json({
                "type": "runner",
                "status": "list",
                "files": self._list_user_files(),
                "running": self.current_module,
            })
        except Exception as e:
            print("Failed to send file list:", e)


runner_manager = RunnerManager()