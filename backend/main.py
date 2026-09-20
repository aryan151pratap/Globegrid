from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.device_ws import router as device_ws_router
from routers.dashboard_ws import router as dashboard_ws_router
from routers.httpRoute.auth_http import router as auth_router
from routers.httpRoute.espConn import router as esp_router
from routers.agent_ws import router as agent_ws_router
from routers.httpRoute.userRoute import router as user_router
from routers.httpRoute.deviceRoute import router as device_router
from routers.httpRoute.agentRoute import router as agent_router
from routers.httpRoute.codeRoute import router as code_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(device_ws_router)
app.include_router(dashboard_ws_router)
app.include_router(auth_router)
app.include_router(esp_router)
app.include_router(agent_ws_router)
app.include_router(user_router)
app.include_router(device_router)
app.include_router(agent_router)
app.include_router(code_router)