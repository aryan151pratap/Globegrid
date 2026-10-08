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
import { useEffect, useState } from "react";
import Header from "./Header";
import { useEsp } from "./useEsp";

const PATHS = {
    memory: "M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
    status: "M3 12h4l3-8 4 16 3-8h4",
    on: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
    off: "M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z",
};

const TONES = {
    blue: ["bg-[#4fb2ff]/10 text-[#4fb2ff] ring-[#4fb2ff]/20", "hover:border-[#4fb2ff]/50 hover:shadow-[0_8px_30px_-8px_rgba(79,178,255,0.35)]"],
    amber: ["bg-[#ffb84f]/10 text-[#ffb84f] ring-[#ffb84f]/20", "hover:border-[#ffb84f]/50 hover:shadow-[0_8px_30px_-8px_rgba(255,184,79,0.35)]"],
    slate: ["bg-[#8b9ab0]/10 text-[#9fb0c6] ring-[#8b9ab0]/20", "hover:border-[#8b9ab0]/50 hover:shadow-[0_8px_30px_-8px_rgba(139,154,176,0.3)]"],
};

const COMMANDS = [
    { label: "Memory", hint: "Heap report", icon: "memory", tone: "blue", payload: { cmd: "memory_report" } },
    { label: "Get status", hint: "Device info", icon: "status", tone: "blue", payload: { cmd: "status" } },
    { label: "LED ON", hint: "Turn on", icon: "on", tone: "amber", payload: { cmd: "led", value: 1 } },
    { label: "LED OFF", hint: "Turn off", icon: "off", tone: "slate", payload: { cmd: "led", value: 0 } },
];

const GRID = {
    backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
    backgroundSize: "44px 44px",
    maskImage: "radial-gradient(ellipse at 50% 0%,black 30%,transparent 75%)",
    WebkitMaskImage: "radial-gradient(ellipse at 50% 0%,black 30%,transparent 75%)",
};

const Icon = ({ name }) => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={PATHS[name]} />
    </svg>
);

const displayValue = (v) => (v === null || v === undefined ? "null" : typeof v === "object" ? JSON.stringify(v) : String(v));

const valueColor = (v) =>
    typeof v === "number" ? "text-[#4fb2ff]"
    : typeof v === "boolean" ? (v ? "text-[#4ade80]" : "text-[#f87171]")
    : v == null ? "text-[#4a5568]"
    : "text-[#e6edf3]";

function Sparkline({ points }) {
    if (points.length < 2) return null;
    const [w, h] = [112, 40];
    const min = Math.min(...points);
    const span = Math.max(...points) - min || 1;
    const xy = points.map((p, i) => [(i * w) / (points.length - 1), h - 4 - ((p - min) / span) * (h - 8)]);
    const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const [lx, ly] = xy[xy.length - 1];
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs>
                <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4fb2ff" stopOpacity="0.35" /><stop offset="100%" stopColor="#4fb2ff" stopOpacity="0" /></linearGradient>
            </defs>
            <polygon points={`0,${h} ${line} ${w},${h}`} fill="url(#spark)" />
            <polyline points={line} fill="none" stroke="#4fb2ff" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={lx} cy={ly} r="2.5" fill="#4fb2ff" />
        </svg>
    );
}

const Card = ({ title, right, children }) => (
    <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#10151c]/80 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {title && (
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d8a9c]">{title}</h2>
                {right}
            </div>
        )}
        {children}
    </section>
);

export default function Sample() {
    const { data, history, send, latency, running } = useEsp();
    const [lastSent, setLastSent] = useState(null);
    const [latencies, setLatencies] = useState([]);
    const fields = data ? Object.entries(data) : [];
    const hasLatency = latency !== null && latency !== undefined;
    useEffect(() => { if (hasLatency) setLatencies((p) => [...p.slice(-29), latency]); }, [latency, hasLatency]);

    const handleSend = (cmd) => {
        send(cmd.payload);
        setLastSent({ label: cmd.label, time: new Date().toLocaleTimeString(), id: Date.now() });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080b10] font-sans text-[#e6edf3] antialiased">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#4fb2ff]/[0.09] blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-[#7c5cff]/[0.06] blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.35]" style={GRID} />
            </div>
            <div className="relative">
                <Header deviceName="ESP32" connected={running} />
                <main className="mx-auto max-w-2xl space-y-5 px-6 py-10">
                    <Card>
                        <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex items-center gap-4">
                                <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${running ? "bg-[#4fb2ff]/10 text-[#4fb2ff] ring-[#4fb2ff]/25" : "bg-white/[0.03] text-[#4a5568] ring-white/[0.06]"}`}>
                                    {running && <span className="absolute inset-0 animate-ping rounded-xl bg-[#4fb2ff]/10" />}
                                    <span className="relative"><Icon name="memory" /></span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#f1f5f9]">{running ? "Code running on ESP32" : "Not receiving data"}</p>
                                    <p className="mt-0.5 text-xs text-[#7d8a9c]">
                                        <span className="font-mono text-[#9fb0c6]">{history.length}</span> messages
                                        <span className="mx-1.5 text-[#2a3644]">•</span>
                                        <span className="font-mono text-[#9fb0c6]">{fields.length}</span> fields
                                    </p>
                                </div>
                            </div>
                            {hasLatency && (
                                <div className="flex items-center gap-4">
                                    <Sparkline points={latencies} />
                                    <div className="text-right">
                                        <p className="font-mono text-2xl font-semibold leading-none text-[#4fb2ff]">
                                            {Math.round(latency)}<span className="ml-1 text-xs font-normal text-[#7d8a9c]">ms</span>
                                        </p>
                                        <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[#4a5568]">latency</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                    <Card
                        title="Latest reading"
                        right={
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${running ? "bg-[#4ade80]/10 text-[#4ade80] ring-[#4ade80]/20" : "bg-white/[0.03] text-[#4a5568] ring-white/[0.06]"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-[#4ade80]" : "bg-[#4a5568]"}`} />
                                {running ? "live" : "idle"}
                            </span>
                        }
                    >
                        {!data ? (
                            <div className="flex flex-col items-center gap-3 px-5 py-16">
                                <div className="flex gap-1.5">{[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4fb2ff]/60" style={{ animationDelay: `${d}ms` }} />)}</div>
                                <p className="font-mono text-sm text-[#4a5568]">waiting for data<span className="animate-pulse">_</span></p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-px bg-white/[0.04] sm:grid-cols-2">
                                {fields.map(([key, value]) => {
                                    const isObj = typeof value === "object" && value !== null;
                                    return (
                                        <div key={key} className={`bg-[#10151c] px-5 py-4 transition-colors hover:bg-[#151c26] ${isObj ? "sm:col-span-2" : ""}`}>
                                            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#7d8a9c]">{key}</p>
                                            <p className={`mt-1.5 break-all font-mono ${isObj ? "text-xs leading-relaxed" : "text-lg font-medium"} ${valueColor(value)}`}>
                                                {displayValue(value)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                    <Card title="Send to device">
                        <div className="px-5 py-5">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {COMMANDS.map((cmd) => (
                                    <button
                                        key={cmd.label}
                                        onClick={() => handleSend(cmd)}
                                        className={`group flex flex-col items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-left transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${TONES[cmd.tone][1]}`}
                                    >
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110 ${TONES[cmd.tone][0]}`}>
                                            <Icon name={cmd.icon} />
                                        </span>
                                        <span>
                                            <span className="block text-[13px] font-semibold text-[#e6edf3]">{cmd.label}</span>
                                            <span className="mt-0.5 block text-[11px] text-[#7d8a9c]">{cmd.hint}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 flex h-9 items-center rounded-lg border border-white/[0.05] bg-black/20 px-3 font-mono text-xs">
                                {lastSent ? (
                                    <p key={lastSent.id} className="flex items-center gap-2 text-[#7d8a9c]">
                                        <span className="text-[#4ade80]">›</span>
                                        sent <span className="text-[#e6edf3]">"{lastSent.label}"</span>
                                        <span className="text-[#4a5568]">at {lastSent.time}</span>
                                    </p>
                                ) : (
                                    <p className="text-[#4a5568]"><span className="text-[#2a3644]">›</span> no commands sent yet</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
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