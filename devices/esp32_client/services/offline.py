"""
services/wifi_setup.py — minimal, built on your own services/wifi.py
(WiFiManager class) and services/scanWifi.py (scan_wifi).

    from services.wifi_setup import ensure_wifi
    wifi = await ensure_wifi()   # returns a connected WiFiManager; portal only runs if needed
"""

import network, uasyncio as asyncio, ujson, time
from services.wifi import WiFiManager
from services.scanWifi import scan_wifi

CONFIG_PATH = "/esp32_client/config.py"
AP_SSID = "ESP32_Setup"
AP_IP = "192.168.4.1"
wifi_lock = asyncio.Lock()   # scan and connect share the radio -- never run both at once

# --- background retry tuning ---------------------------------------------
MAX_RETRY_ATTEMPTS = 20      # give up auto-reconnect after this many tries
RETRY_TIME_BUDGET = 60       # ...or after this many seconds, whichever comes first
CONNECT_ATTEMPT_TIMEOUT = 4  # short per-attempt timeout so the lock isn't held long,
                              # letting manual scans/connects through quickly

PAGE = """<!DOCTYPE html><meta name=viewport content="width=device-width,initial-scale=1">
<body style="font-family:sans-serif;background:#111;color:#eee;padding:24px;max-width:380px;margin:auto">
<h3>WiFi Setup</h3>
<p id=cur style="opacity:.7;font-size:.9em"></p>
<button id=r type=button style="width:100%;padding:8px;margin-bottom:8px">Rescan</button>
<form id=f>
<select id=l style="width:100%;padding:8px;margin:6px 0;box-sizing:border-box"><option value="">Scanning...</option></select>
<input id=m placeholder="Or type SSID manually" style="width:100%;padding:8px;margin:6px 0;box-sizing:border-box">
<input id=p type=password placeholder=Password style="width:100%;padding:8px;margin:6px 0;box-sizing:border-box">
<label style="font-size:.85em;opacity:.8;display:block;margin:-2px 0 10px"><input id=sp type=checkbox> Show password</label>
<button style="width:100%;padding:10px;background:#CEF144;border:0">Connect</button>
</form><p id=o></p>
<script>
async function loadCurrent(){
try{const c=await(await fetch('/current')).json();
if(c.ssid){cur.textContent='Currently configured: '+c.ssid+' / '+(c.password||'(no password)');
m.value=c.ssid; p.value=c.password||'';}
else{cur.textContent='No network configured yet.';}
}catch(e){}}
loadCurrent();
async function scan(){l.innerHTML='<option>Scanning...</option>';
try{const nets=await(await fetch('/networks')).json();
if(!nets.length){l.innerHTML='<option value="">No networks found</option>';return;}
l.innerHTML='<option value="">-- select --</option>'+nets.map(n=>`<option value="${n.ssid}">${n.ssid} (${n.rssi}dBm)</option>`).join('');
}catch(e){l.innerHTML='<option value="">Scan failed, type manually</option>';}}
r.onclick=scan; scan();
sp.onclick=()=>p.type=sp.checked?'text':'password';
f.onsubmit=async e=>{e.preventDefault();
const ssid=m.value||l.value;
if(!ssid){o.textContent='Pick or type a network.';return;}
o.textContent='Connecting...';
const res=await(await fetch('/c',{method:'POST',body:JSON.stringify({s:ssid,p:p.value})})).json();
o.textContent=res.m;};
</script></body>"""


def _save(ssid, pw):
    with open(CONFIG_PATH) as f:
        lines = f.readlines()
    out = []
    for line in lines:
        if line.startswith("WIFI_SSID"):
            out.append('WIFI_SSID = "%s"\n' % ssid)
        elif line.startswith("WIFI_PASSWORD"):
            out.append('WIFI_PASSWORD = "%s"\n' % pw)
        else:
            out.append(line)
    with open(CONFIG_PATH, "w") as f:
        f.write("".join(out))


def _load():
    try:
        import config
        if config.WIFI_SSID and config.WIFI_SSID != "YOUR_WIFI_SSID":
            return {"s": config.WIFI_SSID, "p": config.WIFI_PASSWORD}
    except (ImportError, AttributeError):
        pass
    return None


def _try_connect(ssid, pw, timeout=15):
    try:
        sta = network.WLAN(network.STA_IF)
        if sta.active():
            sta.disconnect()
            time.sleep(0.2)
        wm = WiFiManager(ssid, pw)
        ok = wm.connect(timeout=timeout)
        if ok:
            return wm
        # failed connect can leave the driver in a bad state for scanning --
        # fully cycle the interface instead of just disconnecting
        sta.active(False)
        time.sleep(0.3)
        sta.active(True)
        time.sleep(0.3)
        return None
    except OSError as e:
        print("connect attempt failed:", e)
        try:
            sta = network.WLAN(network.STA_IF)
            sta.active(False)
            time.sleep(0.3)
            sta.active(True)
        except Exception:
            pass
        return None

def _retry_delay(attempt):
    # staged backoff: quick tries first, then progressively spaced further apart
    if attempt <= 3:
        return 2
    elif attempt <= 8:
        return 5
    elif attempt <= 15:
        return 8
    else:
        return 12


async def _handle(r, w, got_ip):
    try:
        method, path, _ = (await r.readline()).decode().split(" ")
        length = 0
        while True:
            h = await r.readline()
            if h in (b"\r\n", b""):
                break
            if h.lower().startswith(b"content-length:"):
                length = int(h.split(b":")[1])
        print("method ", method)
        if method == "GET" and path == "/":
            w.write("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n" + PAGE)
        elif method == "GET" and path == "/current":
            creds = _load() or {}
            w.write("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n"
                     + ujson.dumps({"ssid": creds.get("s", ""), "password": creds.get("p", "")}))
        elif method == "GET" and path == "/networks":
            try:
                async with wifi_lock:   # never scan while a connect attempt is running
                    nets = scan_wifi()
                    print("nets ", nets)
                w.write("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + ujson.dumps(nets))
            except Exception as e:
                w.write("HTTP/1.1 500 Error\r\nContent-Type: application/json\r\n\r\n" + ujson.dumps({"error": str(e)}))
        elif method == "POST" and path == "/c":
            d = ujson.loads(await r.readexactly(length) if length else b"{}")
            async with wifi_lock:   # never connect while a scan is running
                wm = _try_connect(d.get("s", ""), d.get("p", ""))
            if wm:
                _save(d["s"], d["p"])
                msg = "Password saved -- connected! IP " + wm.ip()
            else:
                msg = "Failed to connect, try again."
            w.write("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + ujson.dumps({"m": msg}))
            if wm:
                got_ip.append(wm)
        await w.drain()
    except Exception as e:
        print("portal err:", e)
    finally:
        await w.wait_closed()


async def _background_retry(ssid, pw, got_ip):
    start = time.time()
    attempt = 0
    while (
        not got_ip
        and attempt < MAX_RETRY_ATTEMPTS
        and (time.time() - start) < RETRY_TIME_BUDGET
    ):
        attempt += 1
        async with wifi_lock:   # don't collide with a manual scan or connect
            wm = _try_connect(ssid, pw, timeout=CONNECT_ATTEMPT_TIMEOUT)
        if got_ip:
            return  # someone else (the portal) already connected first
        if wm:
            got_ip.append(wm)
            return
        await asyncio.sleep(_retry_delay(attempt))

    if not got_ip:
        print("background retry: giving up after %d attempts (~%ds) -- "
              "waiting for manual setup via portal" % (attempt, time.time() - start))


async def ensure_wifi():
    creds = _load()
    got_ip = []

    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid=AP_SSID, authmode=network.AUTH_OPEN)
    ap.ifconfig((AP_IP, "255.255.255.0", AP_IP, AP_IP))
    try:
        import mdns
        mdns.start("esp32setup")   # -> http://esp32setup.local
    except ImportError:
        pass
    print("AP up: '%s' @ %s -- also retrying saved WiFi in background" % (AP_SSID, AP_IP))

    server = await asyncio.start_server(lambda r, w: _handle(r, w, got_ip), "0.0.0.0", 80)

    retry_task = None
    if creds:
        retry_task = asyncio.create_task(_background_retry(creds["s"], creds["p"], got_ip))

    while not got_ip:
        await asyncio.sleep(1)   # loop exits as soon as EITHER path connects

    if retry_task:
        retry_task.cancel()
    server.close()
    ap.active(False)
    return got_ip[0]