export const data = {
    language: "react",

files: [
{
    name: "index.html",
    path: "/public/index.html",
    type: "file",
    content: `<!DOCTYPE html>
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
</html>`,
  }
]};


export const sample_projects = [
  {
    name: "ESP32 Sensor Dashboard ESP32 Sensor Dashboard",
    description: "Live temperature and humidity monitoring dashboard for ESP32.",
    language: "react",
    device_id: "esp32_10061c6759e4",

    files: [
      {
        name: "index.html",
        path: "/public/index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESP32 Sensor Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      },

      {
        name: "App.jsx",
        path: "/App.jsx",
        type: "file",
        content: `import Header from "./Header";
import SensorCard from "./SensorCard";

export default function App() {
  return (
    <div className="p-6 bg-zinc-950 min-h-screen">
      <Header />

      <div className="grid grid-cols-2 gap-4 mt-6">
        <SensorCard
          title="Temperature"
          value="25°C"
        />

        <SensorCard
          title="Humidity"
          value="62%"
        />
      </div>
    </div>
  );
}`,
      },

      {
        name: "Header.jsx",
        path: "/Header.jsx",
        type: "file",
        content: `export default function Header() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">
        ESP32 Sensor Dashboard
      </h1>

      <p className="mt-1 text-sm text-zinc-400">
        Live device monitoring
      </p>
    </div>
  );
}`,
      },

      {
        name: "SensorCard.jsx",
        path: "/SensorCard.jsx",
        type: "file",
        content: `export default function SensorCard({ title, value }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}`,
      },

      {
        name: "deviceService.jsx",
        path: "/services/deviceService.jsx",
        type: "file",
        content: `let socket = null;

export function connectDashboard(onMessage, onConnectionChange) {
  socket = new WebSocket("ws://localhost:8000/ws/dashboard");

  socket.onopen = () => {
    onConnectionChange?.(true);
  };

  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      onMessage?.({
        type: "error",
        data: "Invalid message from backend"
      });
    }
  };

  socket.onclose = () => {
    onConnectionChange?.(false);
    socket = null;
  };

  return socket;
}

export function disconnectDashboard() {
  socket?.close();
  socket = null;
}

export function sendToBackend(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(data));
  return true;
}

export function isConnected() {
  return socket?.readyState === WebSocket.OPEN;
}`,
      },

      {
        name: "config.json",
        path: "/config.json",
        type: "file",
        content: `{
  "project": {
    "name": "ESP32 Sensor Dashboard",
    "description": "Live temperature and humidity monitoring dashboard for ESP32",
    "type": "react",
    "version": "1.0.0",
    "fileCount": 6
  },
  "device": {
    "deviceId": "esp32_10061c6759e4",
    "name": "ESP32",
    "autoConnect": true,
    "connection": {
      "type": "websocket"
    }
  }
}`,
      },
    ],
  },

  {
    name: "ESP32 Car Controller",
    description: "Control an ESP32 based car with movement and device controls.",
    language: "react",
    device_id: "esp32_001",

    files: [
      {
        name: "index.html",
        path: "/public/index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESP32 Car Controller</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      },

      {
        name: "App.jsx",
        path: "/App.jsx",
        type: "file",
        content: `import Header from "./Header";
import ControlPanel from "./ControlPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <Header />
      <ControlPanel />
    </div>
  );
}`,
      },

      {
        name: "Header.jsx",
        path: "/Header.jsx",
        type: "file",
        content: `export default function Header() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">
        ESP32 Car Controller
      </h1>

      <p className="text-sm text-zinc-400 mt-1">
        Remote vehicle control
      </p>
    </div>
  );
}`,
      },

      {
        name: "ControlPanel.jsx",
        path: "/ControlPanel.jsx",
        type: "file",
        content: `import { sendToBackend } from "./services/deviceService";

export default function ControlPanel() {

  const command = (action) => {
    sendToBackend({
      type: "device_command",
      action
    });
  };

  return (
    <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
      <div />

      <button
        onClick={() => command("forward")}
        className="rounded-lg bg-zinc-800 p-4 text-white hover:bg-zinc-700"
      >
        ↑
      </button>

      <div />

      <button
        onClick={() => command("left")}
        className="rounded-lg bg-zinc-800 p-4 text-white hover:bg-zinc-700"
      >
        ←
      </button>

      <button
        onClick={() => command("stop")}
        className="rounded-lg bg-red-600 p-4 text-white hover:bg-red-500"
      >
        STOP
      </button>

      <button
        onClick={() => command("right")}
        className="rounded-lg bg-zinc-800 p-4 text-white hover:bg-zinc-700"
      >
        →
      </button>

      <div />

      <button
        onClick={() => command("backward")}
        className="rounded-lg bg-zinc-800 p-4 text-white hover:bg-zinc-700"
      >
        ↓
      </button>
    </div>
  );
}`,
      },

      {
        name: "deviceService.jsx",
        path: "/services/deviceService.jsx",
        type: "file",
        content: `let socket = null;

export function connectDashboard(onMessage, onConnectionChange) {
  socket = new WebSocket("ws://localhost:8000/ws/dashboard");

  socket.onopen = () => {
    onConnectionChange?.(true);
  };

  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      onMessage?.({
        type: "error",
        data: "Invalid message"
      });
    }
  };

  socket.onclose = () => {
    onConnectionChange?.(false);
    socket = null;
  };

  return socket;
}

export function disconnectDashboard() {
  socket?.close();
  socket = null;
}

export function sendToBackend(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(data));
  return true;
}`,
      },

      {
        name: "config.json",
        path: "/config.json",
        type: "file",
        content: `{
  "project": {
    "name": "ESP32 Car Controller",
    "description": "Remote vehicle control dashboard",
    "type": "react",
    "version": "1.0.0",
    "fileCount": 6
  },
  "device": {
    "deviceId": "esp32_001",
    "name": "ESP32 Car",
    "autoConnect": true,
    "connection": {
      "type": "websocket"
    }
  }
}`,
      },
    ],
  },

  {
    name: "ESP32 Environment Monitor",
    description: "Simple environment monitoring interface for ESP32 sensors.",
    language: "react",
    device_id: "esp32_environment_01",

    files: [
      {
        name: "index.html",
        path: "/public/index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Environment Monitor</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      },

      {
        name: "App.jsx",
        path: "/App.jsx",
        type: "file",
        content: `import Header from "./Header";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <Header />

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Environment data
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-zinc-500">Temperature</p>
            <p className="text-2xl text-white">25°C</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Humidity</p>
            <p className="text-2xl text-white">60%</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Pressure</p>
            <p className="text-2xl text-white">1012 hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
}`,
      },

      {
        name: "Header.jsx",
        path: "/Header.jsx",
        type: "file",
        content: `export default function Header() {
  return (
    <header>
      <h1 className="text-2xl font-bold text-white">
        Environment Monitor
      </h1>

      <p className="text-sm text-zinc-400 mt-1">
        ESP32 environmental sensors
      </p>
    </header>
  );
}`,
      },

      {
        name: "deviceService.jsx",
        path: "/services/deviceService.jsx",
        type: "file",
        content: `let socket = null;

export function connectDashboard(onMessage, onConnectionChange) {
  socket = new WebSocket("ws://localhost:8000/ws/dashboard");

  socket.onopen = () => {
    onConnectionChange?.(true);
  };

  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      onMessage?.({
        type: "error",
        data: "Invalid JSON"
      });
    }
  };

  socket.onclose = () => {
    onConnectionChange?.(false);
    socket = null;
  };
}

export function disconnectDashboard() {
  socket?.close();
  socket = null;
}

export function sendToBackend(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(data));
  return true;
}`,
      },

      {
        name: "config.json",
        path: "/config.json",
        type: "file",
        content: `{
  "project": {
    "name": "ESP32 Environment Monitor",
    "description": "Environmental sensor monitoring dashboard",
    "type": "react",
    "version": "1.0.0",
    "fileCount": 5
  },
  "device": {
    "deviceId": "esp32_environment_01",
    "name": "Environment ESP32",
    "autoConnect": true,
    "connection": {
      "type": "websocket"
    }
  }
}`,
      },
    ],
  },
];