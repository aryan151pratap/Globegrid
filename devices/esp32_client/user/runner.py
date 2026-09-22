from services.device import send_json, receive_json
import uasyncio as asyncio
import blink
from sample import sample_sender


async def safe_send(payload):
    """send_json can fail too (e.g. connection dropped) - never let that crash the loop."""
    try:
        await send_json(payload)
    except Exception as e:
        print("Send error:", e)


async def receiver():
    while True:
        try:
            data = await receive_json()
        except Exception as e:
            print("Receive error:", e)
            continue

        if data is None:
            continue

        if data.get("type") != "runner":
            continue

        payload = data.get("data")
        if not isinstance(payload, dict):
            continue

        cmd = payload.get("cmd")

        try:
            if cmd == "led":
                value = payload.get("value")
                if value == 1:
                    blink.led_on()
                else:
                    blink.led_off()

                await safe_send({
                    "cmd": "led",
                    "led": value
                })

            else:
                await safe_send({
                    "cmd": cmd,
                    "error": "Unknown command"
                })

        except Exception as e:
            print("Runner error:", e)
            await safe_send({
                "cmd": cmd,
                "error": str(e)
            })


async def main():
    sender_task = asyncio.create_task(sample_sender())
    receiver_task = asyncio.create_task(receiver())

    try:
        await asyncio.gather(
            sender_task,
            receiver_task
        )

    except asyncio.CancelledError:
        sender_task.cancel()
        receiver_task.cancel()
        await asyncio.gather(
            sender_task,
            receiver_task,
            return_exceptions=True
        )
        blink.led_off()
        print("Program stopped")
        raise