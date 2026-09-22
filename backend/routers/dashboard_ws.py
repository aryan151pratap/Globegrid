import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.manager.device_manager import manager
from services.manager.dashboard_manager import dashboard_manager

from services.auth_service import get_user_ws
router = APIRouter()

@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await websocket.accept()
    user_id = await get_user_ws(websocket)
    if user_id is None:
        return

    await dashboard_manager.connect(user_id, websocket)
    print("dashboard websocket: user=", user_id)

    try:
        while True:
            data = await websocket.receive_json()
            print("frontend websocket data ", data)
            message_type = data.get("type") 
            if message_type == "terminal_input":
                await handle_terminal(data, websocket)
            elif message_type == "filesystem":
                await handle_filesystem(data, websocket)

    except WebSocketDisconnect:
        dashboard_manager.disconnect(user_id, websocket)
        print("🖥️ Dashboard disconnected")

import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.manager.device_manager import manager
from services.manager.dashboard_manager import dashboard_manager

from services.auth_service import get_user_ws
router = APIRouter()

@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await websocket.accept()
    user_id = await get_user_ws(websocket)
    if user_id is None:
        return

    await dashboard_manager.connect(user_id, websocket)
    print("dashboard websocket: user=", user_id)

    try:
        while True:
            data = await websocket.receive_json()
            # print("frontend websocket data ", data)
            message_type = data.get("type") 
            if message_type == "terminal_input":
                await handle_terminal(data, websocket)
            elif message_type == "filesystem":
                await handle_filesystem(data, websocket)
            elif message_type == "runner":
                await handle_runner(data, websocket)

    except WebSocketDisconnect:
        dashboard_manager.disconnect(user_id, websocket)
        print("🖥️ Dashboard disconnected")

async def send_to_device(data, dashboard_ws, device_data, create_pending=True):
    device_id = data.get("device_id")

    if device_id is None:
        await dashboard_ws.send_json({
            "type": "error",
            "data": "device_id is required"
        })
        return

    device_ws = manager.get_websocket(device_id)

    if device_ws is None:
        await dashboard_ws.send_json({
            "type": "error",
            "data": f"Device {device_id} is not connected"
        })
        return

    request_id = str(uuid.uuid4())

    if create_pending:
        dashboard_manager.create_pending_request(
            request_id,
            "ws",
            dashboard_ws
        )

    try:
        await device_ws.send_json({
            **device_data,
            "request_id": request_id,
            "request_type": "ws"
        })

    except Exception:
        dashboard_manager.cancel_request(request_id)
        manager.unregister(device_id, device_ws)

        await dashboard_ws.send_json({
            "type": "error",
            "data": f"Device {device_id} disconnected unexpectedly"
        })


async def handle_terminal(data, dashboard_ws):
    await send_to_device(
        data,
        dashboard_ws,
        {
            "type": "command",
            "data": data.get("data")
        }
    )


async def handle_filesystem(data, dashboard_ws):
    operation = data.get("operation")

    if operation not in [
        "list_folder",
        "read_file",
        "write_file_start",
        "write_file",
        "write_file_end",
        "create",
        "delete"
    ]:
        await dashboard_ws.send_json({
            "type": "error",
            "data": f"Unknown filesystem operation: {operation}"
        })
        return

    await send_to_device(
        data,
        dashboard_ws,
        data,
        create_pending=operation != "write_file"
    )

async def handle_runner(data, dashboard_ws):
    await send_to_device(
        data,
        dashboard_ws,
        data
    )