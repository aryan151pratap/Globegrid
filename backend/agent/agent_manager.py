from agent.agent import Agent
from agent.tools.iot_tools import build_device_tools
from agent.tools.user_tools import User_tools
from fastapi import WebSocket
from starlette.websockets import WebSocketState

class AgentManager:
	def __init__(self):
		self.agents = {}
		self.connections = {}

	def add_connection(self, user_id, websocket):
		if user_id not in self.connections:
			self.connections[user_id] = []
		self.connections[user_id].append(websocket)

	def remove_connection(self, user_id, websocket):
		if user_id not in self.connections:
			return
		if websocket in self.connections[user_id]:
			self.connections[user_id].remove(websocket)
		if not self.connections[user_id]:
			del self.connections[user_id]

	def set_user_tools(self, user_id: int):
		user_tool = User_tools()
		user_tool.set_user_id(user_id)
		user_tool.set_callback("connect", lambda device_id: self.connect_device(user_id, device_id))
		user_tool.set_callback("disconnect", lambda: self.disconnect_device(user_id))
		user_tool.set_callback("check_device", lambda: self.agents.get(user_id).device_id)
		return user_tool.get_tools()
		
	def get_agent(self, user_id: int) -> Agent:
		agent = self.agents.get(user_id)
		if agent is None:
			agent = Agent(user_id)
			agent.set_tools(self.set_user_tools(user_id))
			self.agents[user_id] = agent
		return agent

	async def connect_device(self, user_id: int, device_id: str):
		agent = self.get_agent(user_id)
		agent.device_id = device_id
		agent.set_tools(build_device_tools(device_id))
		await self.agent_details(user_id)
		return agent

	async def disconnect_device(self, user_id: int):
		agent = self.get_agent(user_id)
		agent.device_id = None
		agent.reset_tools(self.set_user_tools(user_id))
		await self.agent_details(user_id)
		return agent

	async def agent_details(self, user_id: int):
		agent = self.agents.get(user_id)
		websockets = self.connections.get(user_id, [])
		if not websockets or not agent:
			return
		data = {
			"type": "details",
			"user_id": user_id,
			"current_device": agent.device_id,
			"model": agent.model,
			"provider": agent.provider,
			"tools": [tool.name if hasattr(tool, "name") else tool.__name__ for tool in agent.tools],
		}
		dead = []
		for websocket in websockets:
			if websocket.client_state != WebSocketState.CONNECTED:
				dead.append(websocket)
				continue
			try:
				await websocket.send_json(data)
			except Exception:
				dead.append(websocket)

		for ws in dead:
			self.remove_connection(user_id, ws)
		
	def remove_agent(self, user_id: int):
		self.agents.pop(user_id, None)

agent_manager = AgentManager()