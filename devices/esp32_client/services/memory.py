# memory.py
"""
Simple async memory/storage info library for ESP32 (MicroPython).

Usage:
    from services import memory
    import uasyncio as asyncio

    asyncio.run(memory.help())      # list what's available
    data = {}
    asyncio.run(memory._run(data))  # or use report() directly, see below
"""

import gc
import os

try:
    import esp32
    HAS_ESP32 = True
except ImportError:
    HAS_ESP32 = False

try:
    import esp
    HAS_ESP = True
except ImportError:
    HAS_ESP = False


def _to_kb(bytes_val):
    return round(bytes_val / 1024, 2)


def _to_mb(bytes_val):
    return round(bytes_val / (1024 * 1024), 2)


def ram():
    """RAM (MicroPython heap) — free / allocated / total, in KB."""
    gc.collect()
    free = gc.mem_free()
    alloc = gc.mem_alloc()
    total = free + alloc
    return {
        "free_kb": _to_kb(free),
        "allocated_kb": _to_kb(alloc),
        "total_kb": _to_kb(total),
        "used_percent": round((alloc / total) * 100, 2) if total else 0,
    }


def flash():
    """Flash chip size (persistent storage, not RAM), in KB/MB."""
    if not HAS_ESP:
        return {"error": "esp module not available"}
    try:
        size = esp.flash_size()
        return {"size_kb": _to_kb(size), "size_mb": _to_mb(size)}
    except Exception as e:
        return {"error": str(e)}


def psram():
    """PSRAM (external SPI RAM) — only present on boards like WROVER."""
    if not HAS_ESP32:
        return {"error": "esp32 module not available"}
    try:
        info = esp32.idf_heap_info(esp32.HEAP_DATA)
        total = sum(region[0] for region in info)
        free = sum(region[1] for region in info)
        return {"total_kb": _to_kb(total), "free_kb": _to_kb(free)}
    except Exception as e:
        return {"error": str(e), "note": "board may not have PSRAM"}


def filesystem(mount="/"):
    """Filesystem usage (LittleFS/FAT partition inside flash), in KB/MB."""
    try:
        stats = os.statvfs(mount)
        block_size = stats[0]
        total = block_size * stats[2]
        free = block_size * stats[3]
        used = total - free
        return {
            "total_kb": _to_kb(total),
            "used_kb": _to_kb(used),
            "free_kb": _to_kb(free),
            "used_percent": round((used / total) * 100, 2) if total else 0,
        }
    except Exception as e:
        return {"error": str(e)}


def cpu():
    """CPU clock frequency, in MHz."""
    try:
        from machine import freq
        return {"freq_mhz": freq() / 1000000}
    except Exception as e:
        return {"error": str(e)}


def report():
    """
    Returns the full report as a plain dict:
    { "ram": {...}, "flash": {...}, "psram": {...}, "filesystem": {...}, "cpu": {...} }
    """
    data = {}
    data["ram"] = ram()
    data["flash"] = flash()
    data["psram"] = psram()
    data["filesystem"] = filesystem()
    data["cpu"] = cpu()
    return data


def help():
    """Prints and returns the list of available functions in this library."""
    info = {
        "ram()": "free / allocated / total heap RAM in KB",
        "flash()": "flash chip size in KB/MB",
        "psram()": "external PSRAM size in KB (error if board has none)",
        "filesystem(mount='/')": "filesystem usage on the given mount, in KB",
        "cpu()": "CPU frequency in MHz",
        "report()": "async — returns all of the above combined in one dict",
    }
    for name, desc in info.items():
        print(name, "-", desc)
    return info