import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiWifi,
  FiWifiOff,
  FiZap,
  FiSun,
  FiVolume2,
  FiOctagon,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiGrid,
  FiNavigation,
  FiRadio,
  FiRefreshCw,
} from "react-icons/fi";

const SEND_INTERVAL_MS = 90; // cadence for continuous commands while a control is active
const DIR_CHAR = { up: "F", down: "B", left: "L", right: "R" };

export default function CarController({ defaultIp = "192.168.4.1", wsPort = 81, maxSpeed = 255 }) {
  const [ip, setIp] = useState(defaultIp);
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [mode, setMode] = useState("dpad"); // dpad | joystick
  const [speedPct, setSpeedPct] = useState(70); // 0-100 -> scaled to maxSpeed
  const [lightsOn, setLightsOn] = useState(false);
  const [hornActive, setHornActive] = useState(false);
  const [activeDir, setActiveDir] = useState(null);
  const [joyVector, setJoyVector] = useState({ x: 0, y: 0 }); // -1..1, y-up positive
  const [lastCommand, setLastCommand] = useState("—");

  const wsRef = useRef(null);
  const sendTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const joyBaseRef = useRef(null);
  const draggingRef = useRef(false);

  const speed = Math.round((speedPct / 100) * maxSpeed);
  const isConnected = status === "connected";

  /* ---------------------------- connection ---------------------------- */

  const connect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) wsRef.current.close();
    setStatus("connecting");

    const socket = new WebSocket(`ws://${ip}:${wsPort}/`);
    wsRef.current = socket;
    socket.onopen = () => setStatus("connected");
    socket.onclose = () => {
      setStatus("disconnected");
      reconnectTimerRef.current = setTimeout(connect, 2000);
    };
    socket.onerror = () => socket.close();
  }, [ip, wsPort]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) wsRef.current.close();
    wsRef.current = null;
    setStatus("disconnected");
  }, []);

  useEffect(
    () => () => {
      clearTimeout(reconnectTimerRef.current);
      clearInterval(sendTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    },
    []
  );

  const send = useCallback((payload) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const text = typeof payload === "string" ? payload : JSON.stringify(payload);
    socket.send(text);
    setLastCommand(text);
  }, []);

  /* ---------------------------- d-pad mode ---------------------------- */

  const startDir = useCallback(
    (dirKey) => {
      const char = DIR_CHAR[dirKey];
      setActiveDir(dirKey);
      send(`${char}:${speed}`);
      clearInterval(sendTimerRef.current);
      sendTimerRef.current = setInterval(() => send(`${char}:${speed}`), SEND_INTERVAL_MS);
    },
    [send, speed]
  );

  const stopDir = useCallback(() => {
    clearInterval(sendTimerRef.current);
    setActiveDir(null);
    send("S");
  }, [send]);

  /* --------------------------- joystick mode --------------------------- */

  const pushJoystick = useCallback(
    (x, y) => {
      const left = Math.max(-1, Math.min(1, y + x));
      const right = Math.max(-1, Math.min(1, y - x));
      send({ left: Math.round(left * speed), right: Math.round(right * speed) });
    },
    [send, speed]
  );

  const updateJoyFromPoint = (clientX, clientY) => {
    const base = joyBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const radius = rect.width / 2;
    let dx = (clientX - (rect.left + radius)) / radius;
    let dy = (clientY - (rect.top + radius)) / radius;
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }
    setJoyVector({ x: dx, y: -dy }); // invert so up = forward = +1
  };

  const handleJoyDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateJoyFromPoint(e.clientX, e.clientY);
  };
  const handleJoyMove = (e) => {
    if (!draggingRef.current) return;
    updateJoyFromPoint(e.clientX, e.clientY);
  };
  const handleJoyUp = () => {
    draggingRef.current = false;
    setJoyVector({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (mode !== "joystick") return undefined;
    clearInterval(sendTimerRef.current);
    sendTimerRef.current = setInterval(() => pushJoystick(joyVector.x, joyVector.y), SEND_INTERVAL_MS);
    return () => clearInterval(sendTimerRef.current);
  }, [mode, joyVector, pushJoystick]);

  /* --------------------------- keyboard (d-pad) --------------------------- */

  useEffect(() => {
    if (mode !== "dpad") return undefined;
    const keyMap = {
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
    };
    const pressed = new Set();

    const onKeyDown = (e) => {
      if (document.activeElement?.tagName?.toLowerCase() === "input") return;
      const key = keyMap[e.key.toLowerCase()];
      if (!key || pressed.has(key)) return;
      pressed.add(key);
      startDir(key);
    };
    const onKeyUp = (e) => {
      const key = keyMap[e.key.toLowerCase()];
      if (!key) return;
      pressed.delete(key);
      if (pressed.size === 0) stopDir();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mode, startDir, stopDir]);

  /* --------------------------- extra controls --------------------------- */

  const emergencyStop = () => {
    clearInterval(sendTimerRef.current);
    setActiveDir(null);
    setJoyVector({ x: 0, y: 0 });
    send("S");
    send({ left: 0, right: 0 });
  };

  const toggleLights = () => {
    const next = !lightsOn;
    setLightsOn(next);
    send(next ? "H1" : "H0");
  };

  const hornDown = () => {
    setHornActive(true);
    send("K1");
  };
  const hornUp = () => {
    setHornActive(false);
    send("K0");
  };

  /* --------------------------------- UI --------------------------------- */

  return (
    <div className="mt-10 mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 p-5 text-neutral-100 shadow-2xl shadow-black/40">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-emerald-400">
            <FiRadio size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">ESP32 Rover</p>
            <p className="mt-1 text-[11px] text-neutral-500">Manual control</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-5 flex items-center gap-2">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.4.1"
          disabled={isConnected}
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm tracking-wide text-neutral-200 outline-none focus:border-emerald-400/50 disabled:opacity-50"
        />
        {isConnected ? (
          <button
            onClick={disconnect}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-white/20"
          >
            <FiWifiOff size={14} /> Disconnect
          </button>
        ) : (
          <button
            onClick={connect}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-emerald-400"
          >
            <FiWifi size={14} /> Connect
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 p-1">
        <ModeButton active={mode === "dpad"} onClick={() => setMode("dpad")} icon={FiGrid} label="D-Pad" />
        <ModeButton active={mode === "joystick"} onClick={() => setMode("joystick")} icon={FiNavigation} label="Joystick" />
      </div>

      {mode === "dpad" ? (
        <DPad activeDir={activeDir} onStart={startDir} onStop={stopDir} />
      ) : (
        <Joystick baseRef={joyBaseRef} vector={joyVector} onDown={handleJoyDown} onMove={handleJoyMove} onUp={handleJoyUp} />
      )}

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <FiZap size={12} /> Max speed
          </span>
          <span className="font-mono text-neutral-300">
            {speed}/{maxSpeed}
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={speedPct}
          onChange={(e) => setSpeedPct(Number(e.target.value))}
          className="w-full accent-emerald-400"
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          onClick={toggleLights}
          className={`inline-flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-[11px] font-medium transition ${
            lightsOn
              ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
              : "border-white/10 text-neutral-400 hover:border-white/20"
          }`}
        >
          <FiSun size={16} /> Lights
        </button>

        <button
          onPointerDown={hornDown}
          onPointerUp={hornUp}
          onPointerLeave={hornUp}
          className={`inline-flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-[11px] font-medium transition select-none ${
            hornActive
              ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
              : "border-white/10 text-neutral-400 hover:border-white/20"
          }`}
        >
          <FiVolume2 size={16} /> Horn
        </button>

        <button
          onClick={emergencyStop}
          className="inline-flex flex-col items-center justify-center gap-1 rounded-xl border border-red-500/40 bg-red-500/10 px-2 py-3 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20 active:scale-95"
        >
          <FiOctagon size={16} /> STOP
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-neutral-500">
        <span>last: {lastCommand}</span>
        <span>{mode === "dpad" ? "WASD / arrows" : "drag to steer"}</span>
      </div>
    </div>
  );
}

/* ============================================================================
 * SUBCOMPONENTS
 * ==========================================================================*/

function StatusBadge({ status }) {
  const map = {
    connected: { label: "Connected", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", Icon: FiWifi },
    connecting: { label: "Connecting…", cls: "text-amber-300 border-amber-400/30 bg-amber-400/10", Icon: FiRefreshCw },
    disconnected: { label: "Offline", cls: "text-neutral-400 border-white/10", Icon: FiWifiOff },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      <Icon size={12} className={status === "connecting" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
        active ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function DPad({ activeDir, onStart, onStop }) {
  const Btn = ({ dirKey, icon: Icon, area }) => (
    <button
      style={{ gridArea: area }}
      onPointerDown={() => onStart(dirKey)}
      onPointerUp={onStop}
      onPointerLeave={onStop}
      onPointerCancel={onStop}
      className={`flex items-center justify-center rounded-2xl border transition select-none ${
        activeDir === dirKey
          ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 text-neutral-300 hover:border-white/20"
      }`}
    >
      <Icon size={22} />
    </button>
  );

  return (
    <div
      className="mx-auto grid h-52 w-52 gap-2"
      style={{
        gridTemplateAreas: `". up ." "left mid right" ". down ."`,
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
      }}
    >
      <Btn dirKey="up" icon={FiArrowUp} area="up" />
      <Btn dirKey="left" icon={FiArrowLeft} area="left" />
      <div style={{ gridArea: "mid" }} className="flex items-center justify-center rounded-2xl border border-white/5 text-neutral-700">
        <FiOctagon size={18} />
      </div>
      <Btn dirKey="right" icon={FiArrowRight} area="right" />
      <Btn dirKey="down" icon={FiArrowDown} area="down" />
    </div>
  );
}

function Joystick({ baseRef, vector, onDown, onMove, onUp }) {
  const offset = 44; // px the knob can travel from center
  return (
    <div
      ref={baseRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative mx-auto h-52 w-52 touch-none select-none rounded-full border border-white/10 bg-black/20"
    >
      <div
        className="absolute left-1/2 top-1/2 h-16 w-16 rounded-full border border-emerald-400/50 bg-emerald-400/20 shadow-lg shadow-emerald-500/20"
        style={{
          transform: `translate(calc(-50% + ${vector.x * offset}px), calc(-50% - ${vector.y * offset}px))`,
        }}
      />
    </div>
  );
}