import urandom
import uasyncio as asyncio
from services.device import send_json


async def safe_send(payload):
    """Mirrors the runner's safe_send: a dropped connection shouldn't crash the loop."""
    try:
        await send_json(payload)
    except Exception as e:
        print("Send error:", e)


def read_temperature():
    # Placeholder reading. Swap for a real sensor call, e.g. dht22.temperature().
    return round(20 + urandom.getrandbits(8) / 255 * 10, 1)


def read_humidity():
    # Placeholder reading. Swap for a real sensor call, e.g. dht22.humidity().
    return round(40 + urandom.getrandbits(8) / 255 * 20, 1)


async def sample_sender(interval=5):
    """Sends a sample sensor reading every `interval` seconds, so the
    dashboard's "latest reading" table has something to show."""
    while True:
        reading = {
            "temperature": read_temperature(),
            "humidity": read_humidity(),
        }
        await safe_send(reading)
        await asyncio.sleep(interval)