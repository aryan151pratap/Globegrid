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

			"/App.jsx": """
import Sample from "./sample";
export default function App() {
    return (
        <div className="bg-zinc-900 h-screen">
            <Sample/>
        </div>
    );
}""",
			"/Header.jsx": """
export default function Header({ deviceName = "ESP32", connected = false }) {
    return (
        <header className="flex items-center justify-between border-b border-[#1f2733] bg-[#0b0f14] px-6 py-4">
            <div className="flex items-center gap-3">
                <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-[#3ddc84]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <rect x="6" y="6" width="12" height="12" rx="1.5" />
                    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
                </svg>
                <div>
                    <h1 className="text-sm font-semibold text-[#e6edf3]">
                        {deviceName} Dashboard
                    </h1>
                    <p className="text-xs text-[#7d8a9c]">Sensor telemetry, live over WebSocket</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span
                    className={`h-2 w-2 rounded-full ${connected ? "bg-[#3ddc84] animate-pulse" : "bg-[#3a4453]"
                        }`}
                />
                <span className="font-mono text-xs text-[#7d8a9c]">
                    {connected ? "connected" : "offline"}
                </span>
            </div>
        </header>
    );
}""",
            "/sample.jsx": """
import { useState } from "react";
import Header from "./Header";
import { useEsp } from "./useEsp";

const COMMANDS = [
    { label: "Ping", payload: { cmd: "ping" } },
    { label: "Get status", payload: { cmd: "status" } },
    { label: "LED ON", payload: { cmd: "led", value: 1 } },
    { label: "LED OFF", payload: { cmd: "led", value: 0 } },
];

function displayValue(value) {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export default function Sample() {
    const { data, history, send } = useEsp();
    const [lastSent, setLastSent] = useState(null);

    const connected = history.length > 0;
    const fields = data ? Object.entries(data) : [];

    const handleSend = (payload) => {
        send(payload);
        setLastSent({ label: payload.command, time: new Date().toLocaleTimeString() });
    };

    return (
        <div className="min-h-screen bg-[#0b0f14] font-sans text-[#e6edf3]">
            <Header deviceName="ESP32" connected={connected} />

            <main className="mx-auto max-w-2xl px-6 py-8">
                <div className="mb-6 flex divide-x divide-[#1f2733] font-mono text-xs text-[#7d8a9c]">
                    <span className="pr-4">{history.length} messages received</span>
                    <span className="px-4">{fields.length} fields</span>
                </div>

                <section className="rounded-lg border border-[#1f2733] bg-[#11161d]">
                    <h2 className="border-b border-[#1f2733] px-5 py-3 text-sm font-semibold text-[#e6edf3]">
                        Latest reading
                    </h2>

                    {!data ? (
                        <p className="px-5 py-8 text-center font-mono text-sm text-[#4a5568]">
                            waiting for data<span className="animate-pulse">_</span>
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {fields.map(([key, value]) => (
                                    <tr key={key} className="border-b border-[#1f2733] last:border-0">
                                        <td className="w-1/3 px-5 py-2.5 text-[#7d8a9c]">{key}</td>
                                        <td className="px-5 py-2.5 font-mono text-[#e6edf3]">
                                            {displayValue(value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                <section className="mt-6 rounded-lg border border-[#1f2733] bg-[#11161d] px-5 py-4">
                    <h2 className="mb-3 text-sm font-semibold text-[#e6edf3]">Send to device</h2>
                    <div className="flex flex-wrap gap-2">
                        {COMMANDS.map((cmd) => (
                            <button
                                key={cmd.label}
                                onClick={() => handleSend(cmd.payload)}
                                className="rounded-md border border-[#2a3644] bg-[#161d27] px-3 py-1.5 text-xs font-medium text-[#e6edf3] transition hover:border-[#4fb2ff] hover:text-[#4fb2ff]"
                            >
                                {cmd.label}
                            </button>
                        ))}
                    </div>
                    {lastSent && (
                        <p className="mt-3 font-mono text-xs text-[#4a5568]">
                            sent "{lastSent.label}" at {lastSent.time}
                        </p>
                    )}
                </section>
            </main>
        </div>
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