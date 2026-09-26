from fastapi import APIRouter, Request, HTTPException

from services.device_sql_service import device_service
from services.manager.device_manager import manager
from services.auth_service import get_current_user
from services.device_sql_service import device_service

router = APIRouter()
@router.get("/devices/available")
async def get_available_devices():
    devices = manager.get_connected_devices()
    print(devices)
    return {
        "devices": devices
    }

@router.delete("/device/delete/{device_id}")
async def device_delete(device_id: str):
    device = device_service.get_device_by_id(device_id)
    print(device)
    if device:
        device_service.delete_device(device_id)
        manager.assign_user(device_id, None)
        return {
            "type": "status",
            "message": f"{device_id} deleted succefully"
        }

    return {
        "type": "warning",
        "message": f"{device_id} device not found"
    }

@router.get("/devices/added")
async def get_added_device(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    devices = device_service.get_user_devices(user["user_id"])
    return devices

@router.post("/devices/add")
async def add_device(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    data = await request.json()
    device_id = data.get("device_id")

    if not device_id:
        raise HTTPException(
            status_code=400,
            detail="Device ID is required"
        )

    existing_device = device_service.get_device_by_id(device_id)
    user_id = user["user_id"]
    if existing_device:
        if existing_device["user_id"] == user_id:
            raise HTTPException(
                status_code=409,
                detail="Device is already saved to your account"
            )

        raise HTTPException(
            status_code=409,
            detail="Device is already registered to another user"
        )
    device = device_service.add_device(
        user_id=user_id,
        device_id=device_id,
        name=data.get("name") or device_id,
        location=data.get("location"),
        firmware=data.get("firmware"),
        platform=data.get("platform"),
        mac_address=data.get("mac"),
        status=data.get("status")
    )

    if not device:
        raise HTTPException(
            status_code=500,
            detail="Failed to save device"
        )
    manager.assign_user(
        device_id=data.get("device_id"),
        user_id=user_id
    )

    return {
        "success": True,
        "message": f"{device_id} saved successfully",
        "device": device
    }