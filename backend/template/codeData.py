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
                    className="h-6 w-6 text-[#4fb2ff]"
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
                <span className="relative flex h-2 w-2">
                    {connected && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4fb2ff] opacity-60" />
                    )}
                    <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                            connected ? "bg-[#4fb2ff]" : "bg-[#3a4453]"
                        }`}
                    />
                </span>
                <span className="font-mono text-xs text-[#7d8a9c]">
                    {connected ? "running" : "idle"}
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
    const { data, history, send, latency, running } = useEsp();
    const [lastSent, setLastSent] = useState(null);

    const fields = data ? Object.entries(data) : [];

    const handleSend = (payload) => {
        send(payload);
        setLastSent({ label: payload.cmd, time: new Date().toLocaleTimeString() });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0d12] to-[#0b0f14] font-sans text-[#e6edf3]">
            <Header deviceName="ESP32" connected={running} />

            <main className="mx-auto max-w-2xl px-6 py-10">
                <div className="mb-6 flex items-center justify-between rounded-xl border border-[#1f2733] bg-[#11161d]/80 px-5 py-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                            {running && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4fb2ff] opacity-60" />
                            )}
                            <span
                                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                                    running ? "bg-[#4fb2ff]" : "bg-[#4a5568]"
                                }`}
                            />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-[#e6edf3]">
                                {running ? "Code running on ESP32" : "Not receiving data"}
                            </p>
                            <p className="text-xs text-[#7d8a9c]">
                                {history.length} messages · {fields.length} fields
                            </p>
                        </div>
                    </div>
                    {latency !== null && (
                        <div className="text-right">
                            <p className="font-mono text-lg font-semibold text-[#4fb2ff]">
                                {Math.round(latency)}
                                <span className="ml-1 text-xs font-normal text-[#7d8a9c]">ms</span>
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-[#4a5568]">latency</p>
                        </div>
                    )}
                </div>

                <section className="overflow-hidden rounded-xl border border-[#1f2733] bg-[#11161d]">
                    <div className="flex items-center justify-between border-b border-[#1f2733] bg-[#0d1117] px-5 py-3.5">
                        <h2 className="text-sm font-semibold tracking-wide text-[#e6edf3]">Latest reading</h2>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                                running
                                    ? "bg-[#4fb2ff]/10 text-[#4fb2ff]"
                                    : "bg-[#4a5568]/10 text-[#4a5568]"
                            }`}
                        >
                            {running ? "live" : "idle"}
                        </span>
                    </div>

                    {!data ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-5 py-14">
                            <p className="font-mono text-sm text-[#4a5568]">
                                waiting for data<span className="animate-pulse">_</span>
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {fields.map(([key, value]) => (
                                    <tr
                                        key={key}
                                        className="border-b border-[#1f2733] transition hover:bg-[#161d27] last:border-0"
                                    >
                                        <td className="w-1/3 px-5 py-3 text-[#7d8a9c]">{key}</td>
                                        <td className="px-5 py-3 font-mono text-[#e6edf3]">
                                            {displayValue(value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                <section className="mt-6 rounded-xl border border-[#1f2733] bg-[#11161d] px-5 py-5">
                    <h2 className="mb-4 text-sm font-semibold tracking-wide text-[#e6edf3]">Send to device</h2>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {COMMANDS.map((cmd) => (
                            <button
                                key={cmd.label}
                                onClick={() => handleSend(cmd.payload)}
                                className="rounded-lg border border-[#2a3644] bg-[#161d27] px-3 py-2.5 text-xs font-medium text-[#e6edf3] transition hover:-translate-y-0.5 hover:border-[#4fb2ff] hover:text-[#4fb2ff] hover:shadow-[0_0_0_1px_#4fb2ff33]"
                            >
                                {cmd.label}
                            </button>
                        ))}
                    </div>
                    {lastSent && (
                        <p className="mt-4 font-mono text-xs text-[#4a5568]">
                            sent <span className="text-[#7d8a9c]">"{lastSent.label}"</span> at {lastSent.time}
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
import { useEffect, useState, useCallback, useRef } from "react";

const STALE_AFTER_MS = 5000; // no message in 5s => treat as not running

export function useEsp() {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [latency, setLatency] = useState(null); // ms, last round-trip time
    const [running, setRunning] = useState(false); // is code actively sending data right now

    const pendingSentAt = useRef(null);
    const staleTimer = useRef(null);

    const markStale = useCallback(() => {
        setRunning(false);
    }, []);

    const resetStaleTimer = useCallback(() => {
        if (staleTimer.current) clearTimeout(staleTimer.current);
        staleTimer.current = setTimeout(markStale, STALE_AFTER_MS);
    }, [markStale]);

    useEffect(() => {
        const onMsg = (e) => {
            const m = e.data;
            if (m?.source !== "esp-bridge" || m.type !== "runner_data") return;

            // if there's a pending send, compute RTT
            if (pendingSentAt.current !== null) {
                const rtt = performance.now() - pendingSentAt.current;
                setLatency(rtt);
                pendingSentAt.current = null;
            }

            setData(m.data);
            setHistory((prev) => [...prev.slice(-49), m.data]);

            // any message means the code is currently running/alive
            setRunning(true);
            resetStaleTimer();
        };
        window.addEventListener("message", onMsg);
        window.parent.postMessage({ source: "esp-bridge", type: "hello" }, "*");
        return () => {
            window.removeEventListener("message", onMsg);
            if (staleTimer.current) clearTimeout(staleTimer.current);
        };
    }, [resetStaleTimer]);

    const send = useCallback((payload) => {
        pendingSentAt.current = performance.now();
        window.parent.postMessage({ source: "esp-bridge", type: "runner", data: payload }, "*");
    }, []);

    return { data, history, send, latency, running };
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