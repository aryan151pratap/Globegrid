import sys
sys.path.append("/esp32_client/lib")

import uasyncio as asyncio
import json
import os

from services.wifi import WiFiManager
from services.websocket_client import WebSocketClient
from config import (WIFI_SSID, WIFI_PASSWORD, WS_SERVER, DEVICE_NAME, SEND_INTERVAL)
from services.device_id import get_device_id
from services.terminal import Terminal
from services.response import handleResponse
from services.runner_manager import runner_manager

DEVICE_ID = get_device_id()

async def receive_loop(client, terminal):
    while True:
        response = await client.receive()
        if response is None:
            raise Exception("server closed the connection")
        try:
            response = json.loads(response)
        except Exception as e:
            error_message = {
                "type": "runner",
                "message": str(e),
            }

            print("Invalid JSON:", e)

            try:
                await client.send_json(error_message)
            except Exception as send_error:
                print("Failed to send error:", send_error)

            continue
        message_type = response.get("type")
        if message_type == "runner":
            runner_manager.handle_message(response)
        else:
            try:
                await handleResponse(client, terminal, response)
            except Exception as e:
                print("handleResponse error:", e)
                try:
                    await client.send_json({
                        "type": "runner",
                        "message": str(e),
                        "response_type": "handler_error",
                    })
                except Exception as send_error:
                    print("Failed to send error:", send_error)

async def run_client(wifi, terminal):
    client = WebSocketClient(WS_SERVER)
    try:
        print("Connecting to WebSocket server:", WS_SERVER)
        await client.connect()
        await client.send_json({
            "type": "register",
            "device_id": DEVICE_ID,
            "name": os.uname().machine
        })
        response = await client.receive()
        print("Register response:", response)
        await runner_manager.start(client)
        await receive_loop(client, terminal)

    except Exception as e:
        print("WebSocket connection lost:", e)
    finally:
        try:
            await runner_manager.stop()
            await client.close()
            print("WebSocket closed")
        except Exception:
            pass


async def main():
    wifi = WiFiManager(WIFI_SSID, WIFI_PASSWORD)
    wifi.connect()
    print("Wi-Fi connected. IP address:", wifi.ip())

    terminal = Terminal()

    while True:
        try:
            if not wifi.isconnected():
                print("Wi-Fi dropped, reconnecting...")
                wifi.connect()
                print("Wi-Fi connected. IP address:", wifi.ip())

            await run_client(wifi, terminal)
        except Exception as e:
            print("main() error:", e)

        await asyncio.sleep(3)


asyncio.run(main())