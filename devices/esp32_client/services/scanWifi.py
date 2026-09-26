import network
import time
def scan_wifi():
	"""Scan for nearby WiFi networks without disturbing an existing connection."""
	wlan = network.WLAN(network.STA_IF)
	if not wlan.active():
		wlan.active(True)
		time.sleep(0.5)
	was_connected = wlan.isconnected()
	current_ssid = wlan.config("essid") if was_connected else None
	raw_results = wlan.scan()
	if not raw_results:
		raw_results = wlan.scan()
	networks = []
	for ssid, bssid, channel, rssi, authmode, hidden in raw_results:
		name = ssid.decode("utf-8", "ignore") if ssid else "(hidden)"
		networks.append({
			"ssid": name,
			"bssid": ":".join("{:02x}".format(b) for b in bssid),
			"channel": channel,
			"rssi": rssi,
			"authmode": authmode,
			"hidden": bool(hidden),
			"current": was_connected and name == current_ssid,
		})

	networks.sort(key=lambda n: n["rssi"], reverse=True)
	return networks


def get_wifi_status():
	wlan = network.WLAN(network.STA_IF)
	if not wlan.active():
		return {"status": "idle", "ssid": None, "ip": None, "rssi": None}

	if wlan.isconnected():
		ip = wlan.ifconfig()[0]
		try:
			ssid = wlan.config("essid")
		except Exception:
			ssid = None
		try:
			rssi = wlan.status("rssi")
		except Exception:
			rssi = None
		return {"status": "connected", "ssid": ssid, "ip": ip, "rssi": rssi}
	status_code = wlan.status()
	if status_code == network.STAT_CONNECTING:
		return {"status": "connecting", "ssid": None, "ip": None, "rssi": None}
	if status_code in (network.STAT_WRONG_PASSWORD, network.STAT_NO_AP_FOUND, network.STAT_CONNECT_FAIL):
		return {"status": "failed", "ssid": None, "ip": None, "rssi": None}
	return {"status": "idle", "ssid": None, "ip": None, "rssi": None}

AUTHMODE_NAMES = {
	0: "OPEN",
	1: "WEP",
	2: "WPA-PSK",
	3: "WPA2-PSK",
	4: "WPA/WPA2-PSK",
	5: "WPA2-ENTERPRISE",
	6: "WPA3-PSK",
	7: "WPA2/WPA3-PSK",
}


def format_networks(networks):
	lines = []
	lines.append("{:<32} {:<18} {:<4} {:<6} {:<16} {}".format(
		"SSID", "BSSID", "CH", "RSSI", "SECURITY", ""
	))
	lines.append("-" * 90)
	for n in networks:
		security = AUTHMODE_NAMES.get(n["authmode"], "UNKNOWN")
		marker = "<- connected" if n["current"] else ""
		lines.append("{:<32} {:<18} {:<4} {:<6} {:<16} {}".format(
			n["ssid"][:32], n["bssid"], n["channel"], n["rssi"], security, marker
		))
	return "\n".join(lines) + "\n"


def print_networks(networks):
	print(format_networks(networks))

if __name__ == "__main__":
	found = scan_wifi()
	print("Found {} network(s):\n".format(len(found)))
	print_networks(found)
STATUS_MESSAGES = {
	"connected": "connected",
	"wrong_password": "incorrect password",
	"no_ap_found": "network not found (out of range or SSID typo)",
	"connect_fail": "connection failed for an unspecified reason",
	"timeout": "timed out waiting for a response",
}


def connect_wifi(ssid, password, timeout=15):
	wlan = network.WLAN(network.STA_IF)

	if not wlan.active():
		wlan.active(True)

	wlan.active(False)
	time.sleep_ms(200)
	wlan.active(True)
	wlan.connect(ssid, password)

	start = time.ticks_ms()
	while not wlan.isconnected():
		status = wlan.status()
		if status == network.STAT_WRONG_PASSWORD:
			return {"connected": False, "status": "wrong_password", "ip": None}
		if status == network.STAT_NO_AP_FOUND:
			return {"connected": False, "status": "no_ap_found", "ip": None}
		if status == network.STAT_CONNECT_FAIL:
			return {"connected": False, "status": "connect_fail", "ip": None}
		if time.ticks_diff(time.ticks_ms(), start) > timeout * 1000:
			wlan.disconnect()
			return {"connected": False, "status": "timeout", "ip": None}
		time.sleep_ms(200)
	return {"connected": True, "status": "connected", "ip": wlan.ifconfig()[0]}
