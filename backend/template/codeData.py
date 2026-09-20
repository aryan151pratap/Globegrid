import json
def get_react_esp32_template(name):
    return {
        "name": name or "ESP32 Sensor Dashboard",
        "description": "Live temperature and humidity monitoring dashboard for ESP32.",
        "language": "react",
        "device_id": None,
        "files": {
            "/services": None,
            "/public": None,
            "/public/index.html": """<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>App</title>
				<script src="https://cdn.tailwindcss.com"></script>
			</head>
			<body>
				<div id="root"></div>
			</body>
			</html>""",

			"/App.jsx": """import Header from "./Header";

			export default function App() {
			return (
				<div className="p-6 bg-zinc-900 min-h-screen">
				<Header />
				<p className="mt-2 text-zinc-400">
					Hello from a project
				</p>
				</div>
			);
			}""",
			"/Header.jsx": """export default function Header() {
			return (
				<h1 className="text-2xl font-bold text-white">
				My Dashboard
				</h1>
			);
			}""",
			"/services/deviceService.jsx": """let socket = null;
		let closedByClient = false;

		const WS_URL = "ws://localhost:8000/ws/dashboard";

		export function connectDashboard(onMessage, onConnectionChange) {
		closedByClient = false;

		socket = new WebSocket(WS_URL);

		socket.onopen = () => {
			onConnectionChange?.(true);
		};

		socket.onmessage = (event) => {
			let data;

			try {
			data = JSON.parse(event.data);
			} catch (e) {
			console.error(
				"Invalid JSON from backend:",
				e,
				event.data
			);

			onMessage?.({
				type: "error",
				data: "Received malformed message from backend"
			});

			return;
			}

			onMessage?.(data);
		};

		socket.onerror = (event) => {
			console.error("WebSocket error:", event);
		};

		socket.onclose = () => {
			onConnectionChange?.(false);

			if (!closedByClient) {
			onMessage?.({
				type: "error",
				data: "Connection to backend lost"
			});
			}

			socket = null;
		};

		return socket;
		}

		export function disconnectDashboard() {
		closedByClient = true;

		if (socket) {
			socket.close();
			socket = null;
		}
		}

		export function sendToBackend(data) {
		if (
			!socket ||
			socket.readyState !== WebSocket.OPEN
		) {
			console.warn(
			"sendToBackend: socket not open, message dropped:",
			data
			);

			return false;
		}

		try {
			socket.send(JSON.stringify(data));
			return true;
		} catch (e) {
			console.error("sendToBackend failed:", e);
			return false;
		}
		}

		export function isConnected() {
		return (
			!!socket &&
			socket.readyState === WebSocket.OPEN
		);
		}""",
			"/config.json": json.dumps({
				"project": {
					"name": name or "ESP32 Sensor Dashboard",
					"description": "Live temperature and humidity monitoring dashboard for ESP32",
					"type": "react",
					"version": "1.0.0"
				},
				"device": {
					"deviceId": "esp32_10061c6759e4",
					"name": "ESP32",
					"autoConnect": True,
					"connection": {
						"type": "websocket"
					}
				}
			}, indent=2)
        }
    }