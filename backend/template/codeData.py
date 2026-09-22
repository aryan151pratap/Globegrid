import json
def get_react_esp32_template(name):
    return {
        "name": name or "ESP32 Sensor Dashboard",
        "description": "Live temperature and humidity monitoring dashboard for ESP32.",
        "language": "react",
        "device_id": None,
        "files": {
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
			"/config.json": json.dumps({
				"project": {
					"name": name or "ESP32 Sensor Dashboard",
					"description": "Live temperature and humidity monitoring dashboard for ESP32",
					"language": "react",
				},
				"device": {
					"deviceId": None,
					"name": "ESP32",
					"autoConnect": False,
					"connection": {
						"type": "websocket"
					}
				}
			}, indent=2),
        "/useEsp.js": """
import { useEffect, useState, useCallback } from "react";

export function useEsp() {
    const [data, setData] = useState(null);      // latest message from the device
    const [history, setHistory] = useState([]);  // last 50 messages, newest last

    useEffect(() => {
        const onMsg = (e) => {
            const m = e.data;
            if (m?.source !== "esp-bridge" || m.type !== "runner_data") return;
            setData(m.data);
            setHistory((prev) => [...prev.slice(-49), m.data]);
        };
        window.addEventListener("message", onMsg);
        window.parent.postMessage({ source: "esp-bridge", type: "hello" }, "*");
        return () => window.removeEventListener("message", onMsg);
    }, []);

    const send = useCallback((payload) => {
        window.parent.postMessage({ source: "esp-bridge", type: "runner", data: payload }, "*");
    }, []);

    return { data, history, send };
}
""",
"/main.jsx": """
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
"""
        }
    }