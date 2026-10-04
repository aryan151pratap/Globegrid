import uuid
import asyncio
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from services.manager.device_manager import manager
from services.device_sql_service import device_service

router = APIRouter(tags=["IOT"])

DEFAULT_TIMEOUT = 5

class WifiCredentials(BaseModel):
    ssid: str
    password: str

@router.get("/device/connection/{device_id}")
async def get_connection(device_id: str):
    device = manager.get_device(device_id)
    if not device:
        device_service.update_status(device_id, "offline")
        return {"type": "error", "message": f"{device_id} offline"}
    print(device)
    websocket = device["websocket"]
    if websocket:
        await websocket.send_json({
            "status": device["status"],
            "user_id": device["user_id"],
            "device_id": device_id,
            "name": device["name"]    
        })
    return {"device_id": device_id, "status": device["status"], "name": device["name"]}

async def send_device_request(device_id: str, payload: dict, timeout: float = DEFAULT_TIMEOUT) -> dict:
    websocket = manager.get_websocket(device_id)
    if websocket is None:
        raise HTTPException(status_code=404, detail="device is not connected")

    request_id = str(uuid.uuid4())
    future = manager.create_pending_request(request_id)

    try:
        await websocket.send_json({**payload, "request_id": request_id, "request_type": "http"})
        return await asyncio.wait_for(future, timeout=timeout)

    except asyncio.TimeoutError:
        manager.cancel_request(request_id)
        raise HTTPException(status_code=504, detail="device did not respond")

    except HTTPException:
        raise

    except Exception as e:
        manager.cancel_request(request_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/device/{device_id}")
async def get_esp(device_id: str):
    result = await send_device_request(device_id, {"type": "details"})
    result["data"]["status"] = "online"
    return result


@router.post("/device/folder/{device_id}")
async def device_folder(device_id: str, path: str = "/"):
    return await send_device_request(
        device_id,
        {"type": "filesystem", "operation": "list_folder", "path": path},
    )


@router.get("/device/wifiStatus/{device_id}")
async def get_wifi_status(device_id: str):
    return await send_device_request(
        device_id,
        {"type": "wifi", "operation": "status"},
        timeout=10,
    )


@router.get("/device/wifiScan/{device_id}")
async def scan_wifi(device_id: str):
    return await send_device_request(
        device_id,
        {"type": "wifi", "operation": "scan"},
        timeout=15,
    )

@router.post("/device/wifiConnect/{device_id}")
async def connect_wifi(device_id: str, credentials: WifiCredentials):
    print("credentials ", credentials)
    return await send_device_request(
        device_id,
        {
            "type": "wifi",
            "operation": "save",
            "data": {
                "ssid": credentials.ssid,
                "pass": credentials.password
            }
        },
        timeout=10,
    )