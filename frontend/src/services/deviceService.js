import { WebSocketClient } from "../websocket/websocketClient";

const dashboardSocket = new WebSocketClient(`/ws/dashboard`);
const agentSocket = new WebSocketClient("/ws/agent");

// Dashboard
export function connectDashboard(onMessage, onConnectionChange) {
    dashboardSocket.onMessage = onMessage;
    dashboardSocket.onConnectionChange = onConnectionChange;
    dashboardSocket.connect();
}

export function sendToBackend(data) {
    dashboardSocket.send(data);
}

export function disconnectDashboard() {
    dashboardSocket.disconnect();
}

// Agent
export function connectAgent(onMessage, onConnectionChange) {
    agentSocket.onMessage = onMessage;
    agentSocket.onConnectionChange = onConnectionChange;
    agentSocket.connect();
}

export function sendToAgent(data) {
    agentSocket.send(data);
}

export function disconnectAgent() {
    agentSocket.disconnect();
}