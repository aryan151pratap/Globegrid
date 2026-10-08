// All landing-page content lives here so Landing.jsx stays small.
// Images use Wikimedia Commons "Special:FilePath" links. If one ever 404s, swap in
// your own photo (put it in /public/images and use "/images/pico.jpg").
// Components fall back to a plain panel automatically if an image fails to load.

const wm = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=1200`;

//https://d3mxt5v3yxgcsr.cloudfront.net/courses/10688/course_10688_image.jpg

export const ROUTES = [
  { label: "Devices", to: "/devices" },
  { label: "Inventory", to: "/inventory" },
  { label: "Editor", to: "/dashboard" }, // editor opens inside the dashboard route
  { label: "Agent", to: "/agent" },
  { label: "Docs", to: "/docs" },
];

export const HERO_IMAGE = `https://d3mxt5v3yxgcsr.cloudfront.net/courses/10688/course_10688_image.jpg`;

export const FEATURES = [
  {
    title: "Remote file editor",
    text: "Browse, open and edit main.py, boot.py and any file on the device from your browser, with no USB cable.",
    tag: "Editor",
  },
  {
    title: "Run & restart",
    text: "Run scripts, soft-reset or hard-reboot a board deployed in a field, a farm or a rooftop.",
    tag: "Control",
  },
  {
    title: "Live sensor data",
    text: "Stream temperature, humidity, voltage or any custom reading over WebSocket and watch it update live.",
    tag: "Monitor",
  },
  {
    title: "AI agent",
    text: "An agent that can read and write device files and help diagnose crashes, so it can find the traceback for you.",
    tag: "AI",
  },
];

export const DEVICES = [
  {
    name: "ESP32",
    chip: "Xtensa LX6 dual-core, 240 MHz",
    specs: ["Wi-Fi + Bluetooth", "520 KB SRAM", "34 GPIO", "Deep-sleep support"],
    text: "The main target for Globgrid. Wi-Fi is built in, so it holds a WebSocket connection to the backend with no extra hardware.",
    image: wm("ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg"),
  },
  {
    name: "Raspberry Pi Pico W",
    chip: "RP2040 dual-core ARM M0+, 133 MHz",
    specs: ["Wi-Fi (CYW43439)", "264 KB SRAM", "26 GPIO", "PIO state machines"],
    text: "A cheap board with first-class MicroPython support. The Pico W can join the same grid as your ESP32s.",
    image: wm("Raspberry_pi_pico_oben.jpg"),
  },
  {
    name: "ESP8266",
    chip: "Tensilica L106, 80 MHz",
    specs: ["Wi-Fi", "~80 KB RAM", "11 GPIO", "Very low cost"],
    text: "Works for small, simple nodes such as relays and basic sensors, where memory is tight.",
    image: wm("Esp_mx_nodemcu_devkit_esp8285_IMGP2969_smial_wp.jpg"),
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Flash MicroPython",
    text: "Flash the MicroPython firmware to your ESP32 or Pico W, then copy the Globgrid client onto the board.",
  },
  {
    n: "02",
    title: "Device connects",
    text: "On boot, the client opens a WebSocket to the FastAPI backend and registers itself in your inventory.",
  },
  {
    n: "03",
    title: "Manage from anywhere",
    text: "Open the dashboard to edit files, run code, restart the board and watch live sensor data.",
  },
];

export const FIRMWARE_SNIPPET = `# main.py on the device (MicroPython)
import network, uasyncio as asyncio
from globgrid import Client

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect("WIFI_NAME", "WIFI_PASS")

async def main():
    gg = Client("wss://your-backend/ws", device_id="esp32-01")
    await gg.run()   # files, run, restart, sensors

asyncio.run(main())`;