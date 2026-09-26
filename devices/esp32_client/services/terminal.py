import sys
import io
import os
import time
import _thread
import uasyncio as asyncio
import machine
from config import USER_ROOT
from services.scanWifi import scan_wifi, format_networks
from services.path_utils import safe_path

class StreamStopped(Exception):
    pass

class Terminal:

    MAX_QUEUE_SIZE = 50
    CANCEL_TIMEOUT_MS = 3000

    def __init__(self):
        self.exec_globals = {"os": os, "machine": machine, "print": self._sync_print, "run": self._run_file}
        self._queue = []
        self._lock = _thread.allocate_lock()
        self._running = False
        self._stop_requested = False

        self._request_id = None
        self._request_type = None
        self._root = USER_ROOT.rstrip("/") or "/"

    def reset(self):
        self.exec_globals = {"os": os, "machine": machine, "print": self._sync_print, "run": self._run_file}
        self._queue = []

    def _run_file(self, path):
        resolved = safe_path(path, self._root)
        with open(resolved) as f:
            source = f.read()
        exec(compile(source, resolved, "exec"), self.exec_globals, self.exec_globals)

    def _push(self, item, ignore_stop=False):
        while True:
            if self._stop_requested and not ignore_stop:
                raise StreamStopped("Stopped by user")
            with self._lock:
                if len(self._queue) < self.MAX_QUEUE_SIZE:
                    self._queue.append(item)
                    return
            time.sleep_ms(20)

    def _create_response(self, data, success=True, status=None, stream = False):
        response = {
            "type": "terminal",
            "request_id": self._request_id,
            "request_type": self._request_type,
            "success": success,
            "data": data,
            "stream": stream
        }

        if status:
            response["status"] = status

        return response

    def _sync_print(self, *args, sep=" ", end="\n", **kwargs):
        data = sep.join(str(a) for a in args) + end
        self._push(
            self._create_response(
                data,
                success=True,
                stream=True
            )
        )

    def _worker(self, command):
        self._stop_requested = False
        result_msg = None

        try:
            try:
                result = eval(command, self.exec_globals, self.exec_globals)
                if result is not None:
                    self._sync_print(result)
            except SyntaxError:
                exec(command, self.exec_globals, self.exec_globals)
            result_msg = self._create_response(
                "",
                success=True,
                status="completed",
                stream=False
            )

        except StreamStopped:
            result_msg = self._create_response(
                "\n^C KeyboardInterrupt - execution stopped.\n",
                success=False,
                status="error"
            )
        except MemoryError:
            result_msg = self._create_response(
                "\n[Error] Out of memory - command aborted.\n",
                success=False,
                status="error"
            )
        except Exception as e:
            buf = io.StringIO()
            sys.print_exception(e, buf)
            result_msg = self._create_response(
                buf.getvalue(),
                success=False,
                status="error"
            )
        finally:
            self._push(result_msg, ignore_stop=True)
            self._running = False

    async def _safe_send(self, send_func, item):
        try:
            await send_func(item)
            return True
        except OSError as e:
            print("WS send failed:", e)
            return False

    async def cancel(self, send_func=None):
        if not self._running:
            return True

        self._stop_requested = True
        start = time.ticks_ms()

        while self._running:
            if time.ticks_diff(time.ticks_ms(), start) > self.CANCEL_TIMEOUT_MS:
                if send_func:
                    await self._safe_send(send_func, 
                        self._create_response(
                            "\n[Warning] Could not confirm stop - "
                            "command may not call print() and cannot "
                            "be interrupted.\n",
                            success=False,
                            status="error"
                        )
                    )
                return False
            await asyncio.sleep_ms(20)

        return True

    async def _run_command(self, command, request_id, request_type, send_func):
        self._request_id = request_id
        self._request_type = request_type
        if command.strip() == "clear":
            if not await self.cancel(send_func=None):
                await self._safe_send(send_func, 
                    self._create_response(
                        "[Error] Cannot clear - a command is "
                        "still running and won't respond to stop.",
                        success=False,
                        status="error"
                    )
                )
                return
            self.reset()
            await self._safe_send(send_func, 
                self._create_response(
                    "Terminal session cleared.\n",
                    success=True,
                    status="completed",
                    stream=False
                )
            )
            return

        elif command.strip() == "scan_wifi":
            try:
                networks = scan_wifi()
            except Exception as e:
                await self._safe_send(send_func,
                    self._create_response(
                        "[Error] WiFi scan failed: {}\n".format(e),
                        success=False,
                        status="error"
                    )
                )
                return
            lines = format_networks(networks)
            await self._safe_send(send_func,
                self._create_response(
                    lines,
                    success=True,
                    status="completed",
                    stream=False,
                )
            )
            return

        elif command == "hard_reset":
            await self.hard_reset(send_func)

        if self._running:
            await self._safe_send(send_func, 
                self._create_response(
                    "[Error] A command is already running. "
                    "Send {\"type\":\"cancel\"} to stop it first.\n",
                    success=False,
                    status="error"
                )
            )
            return

        self._queue = []
        self._running = True
        _thread.start_new_thread(self._worker, (command,))
        while self._running or self._queue:
            with self._lock:
                batch, self._queue = self._queue, []

            for item in batch:
                if not await self._safe_send(send_func, item):
                    await self.cancel(send_func=None)
                    return

            await asyncio.sleep_ms(0)

    async def hard_reset(self, send_func=None):
        if send_func:
            await self._safe_send(send_func,
                self._create_response(
                    "[Warning] Device is resetting - connection will drop.\n",
                    success=True,
                    status="completed",
                    stream=False
                )
            )
            await asyncio.sleep_ms(100)
        machine.reset()

    async def handle_message(self, response, send_func):
        msg_type = response.get("type")
        if msg_type == "command":
            command = response.get("data", "")
            request_id = response.get("request_id")
            request_type = response.get("request_type")
            asyncio.create_task(self._run_command(command, request_id, request_type, send_func))

        elif msg_type == "cancel":
            self._request_id = response.get("request_id")
            self._request_type = response.get("request_type")
            await self.cancel(send_func)
        else:
            await self._safe_send(send_func, {
                "type": "terminal", "success": False,
                "request_id": response.get("request_id"),
                "request_type": response.get("request_type"),
                "data": f"[Error] Unknown message type: {msg_type}\n"
            })