import network
import time


class WiFiManager:

    def __init__(self, ssid, password):
        self.ssid = ssid
        self.password = password
        self.wifi = network.WLAN(network.STA_IF)

    def connect(self, timeout=15):
        self.wifi.active(True)

        if self.wifi.isconnected():
            print("Already Connected")
            return True

        print("Connecting WiFi...", end="")
        self.wifi.connect(self.ssid, self.password)

        t0 = time.time()
        while not self.wifi.isconnected():
            if time.time() - t0 > timeout:
                print("\nTimed out")
                return False
            time.sleep(1)
            print(".", end="")

        print("\nConnected")
        print(self.wifi.ifconfig())
        return True

    def ip(self):
        return self.wifi.ifconfig()[0]

    def isconnected(self):
        return self.wifi.isconnected()