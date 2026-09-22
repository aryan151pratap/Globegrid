from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.manager.device_manager import manager
from services.manager.dashboard_manager import dashboard_manager
from services.device_registration import register_device
from services.manager.agent_device_transport import agent_device_transport
router = APIRouter()

@router.websocket("/ws/device")
async def device_websocket(websocket: WebSocket):
    await websocket.accept()
    device_id = await register_device(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            request_id = data.get("request_id")
            request_type = data.get("request_type")
            # print("backend websocket data ", data)
            if request_id:
                if request_type == "http":
                    manager.resolve_request(
                        request_id,
                        data
                    )

                elif request_type == "ws":
                    await dashboard_manager.resolve_request(
                        request_id,
                        data
                    )
                elif request_type == "agent":
                    await agent_device_transport.resolve_request(request_id, data)
                    
            else:
                user_id = manager.get_user_id(device_id)
                if user_id:
                    await dashboard_manager.broadcast(user_id, data)

    except WebSocketDisconnect:
        print(f"❌ {device_id} disconnected")
        if manager.is_current_connection(device_id, websocket):
            user_id = manager.get_user_id(device_id)
            manager.unregister(
                device_id,
                websocket
            )
            if user_id:
                await dashboard_manager.broadcast(
                    user_id,
                    {
                        "type": "IOT",
                        "device_id": device_id,
                        "status": False
                    }
                )