import { useEffect, useRef, useState } from "react";
import {
	FaArrowLeft,
	FaWifi,
	FaLock,
	FaLockOpen,
	FaSyncAlt,
	FaEye,
	FaEyeSlash,
	FaCheckCircle,
	FaTimesCircle,
	FaSpinner,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa";
import { ScanDeviceWifi, ConnectDeviceWifi, GetWifiStatus } from "../services/iotService";
import { useNotify } from "../components/Device-IDE/notify";

const STATUS_POLL_MS = 3000;
const STATUS_TIMEOUT_MS = 30000;

const AUTHMODE_LABELS = {
	0: "Open",
	1: "WEP",
	2: "WPA-PSK",
	3: "WPA2-PSK",
	4: "WPA/WPA2-PSK",
	5: "WPA2-Enterprise",
	6: "WPA3-PSK",
	7: "WPA2/WPA3-PSK",
};

function isOpenNetwork(n) {
	return n.authmode === 0 || n.secure === false;
}

function signalBars(rssi) {
	// rssi is dBm, typically -30 (excellent) to -90 (unusable)
	if (rssi === undefined || rssi === null) return 0;
	if (rssi >= -55) return 4;
	if (rssi >= -67) return 3;
	if (rssi >= -78) return 2;
	if (rssi >= -85) return 1;
	return 0;
}

function SignalBars({ rssi }) {
	const bars = signalBars(rssi);
	return (
		<div className="flex items-end gap-[1.5px] h-3 w-4">
			{[0, 1, 2, 3].map((i) => (
				<span
					key={i}
					className={`w-[3px] rounded-sm ${i <= bars - 1 ? "bg-orange-500" : "bg-zinc-700"}`}
					style={{ height: `${(i + 1) * 25}%` }}
				/>
			))}
		</div>
	);
}

export function Wifi({ device, onBack }) {
	const notify = useNotify();

	const [networks, setNetworks] = useState([]);
	const [scanning, setScanning] = useState(false);
	const [scanError, setScanError] = useState(null);

	const [selectedSsid, setSelectedSsid] = useState(null);
	const [expandedSsid, setExpandedSsid] = useState(null);
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const [connecting, setConnecting] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState(null); // "connecting" | "connected" | "failed" | null
	const [currentSsid, setCurrentSsid] = useState(device?.wifi_ssid || null);

	const pollRef = useRef(null);
	const timeoutRef = useRef(null);

	const stopPolling = function () {
		if (pollRef.current) clearInterval(pollRef.current);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		pollRef.current = null;
		timeoutRef.current = null;
	};

	useEffect(() => {
		setNetworks([]);
		setScanError(null);
		setSelectedSsid(null);
		setExpandedSsid(null);
		setPassword("");
		setConnecting(false);
		setConnectionStatus(null);
		setCurrentSsid(device?.wifi_ssid || null);
		stopPolling();
		return () => stopPolling();
	}, [device?.device_id]);

	const handleScan = async function () {
		if (!device?.device_id) return;
		try {
			setScanning(true);
			setScanError(null);
			const data = await ScanDeviceWifi(device.device_id);
			const found = data?.networks || [];
			setNetworks(found);

			// if the device reports which network is currently active, trust that over stale state
			const active = found.find((n) => n.current);
			if (active) setCurrentSsid(active.ssid);
		} catch (err) {
			console.log(err);
			setScanError("Couldn't scan for networks. Try again.");
		} finally {
			setScanning(false);
		}
	};

	const applyStatus = function (data) {
		if (!data) return;
		setConnectionStatus(data.status.status == "connected" ? "connected" : "failed");
		console.log(data);
		if (data.status) setCurrentSsid(data.status.ssid);
		if (data.status) {
			stopPolling();
			setConnecting(false);
			if (data.status.status === "connected") notify?.({message: `Connected to ${data.status.ssid || selectedSsid}`, type: "success"});
			if (data.status.status === "disconnected") notify?.({message: "Wi-Fi connection failed", type: "error"});
		}
	};

	const handleCheckStatus = async function () {
		if (!device?.device_id) return;
		try {
			const data = await GetWifiStatus(device.device_id);
			applyStatus(data);
		} catch (err) {
			console.log(err);
			notify?.({message: "Couldn't fetch Wi-Fi status", type: "error"});
		}
	};

	const selectedNetwork = networks.find((n) => n.ssid === selectedSsid) || null;
	const selectedIsOpen = selectedNetwork ? isOpenNetwork(selectedNetwork) : false;

	const handleConnect = async function () {
		if (!device?.device_id || !selectedSsid) return;
		if (!selectedIsOpen && !password) return;

		try {
			setConnecting(true);
			setConnectionStatus("connecting");
			await ConnectDeviceWifi(device.device_id, selectedSsid, selectedIsOpen ? "" : password);

			stopPolling();
			pollRef.current = setInterval(async () => {
				try {
					const data = await ConnectDeviceWifi(device.device_id);
					applyStatus(data);
				} catch (err) {
					console.log(err);
				}
			}, STATUS_POLL_MS);

			timeoutRef.current = setTimeout(() => {
				stopPolling();
				setConnecting(false);
				setConnectionStatus((curr) => (curr === "connecting" ? "failed" : curr));
			}, STATUS_TIMEOUT_MS);
		} catch (err) {
			console.log(err);
			setConnecting(false);
			setConnectionStatus("failed");
			notify?.({message: "Failed to send Wi-Fi credentials", type: "error"});
		}
	};

	const selectNetwork = function (n) {
		setSelectedSsid(n.ssid);
		setConnectionStatus(null);
		setPassword("");
	};

	const toggleDetails = function (ssid, e) {
		e.stopPropagation();
		setExpandedSsid((curr) => (curr === ssid ? null : ssid));
	};

	if (!device) {
		return (
			<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-600">
				<FaWifi size={28} />
				<p className="text-sm">Select a device to configure Wi-Fi</p>
			</div>
		);
	}

	return (
		<div className="md:static fixed inset-0 w-full h-full bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center text-zinc-200 overflow-auto">
			<div className="bg-black md:w-full md:h-full w-fit h-fit border border-zinc-500/20 overflow-auto dark-scrollbar">
				<div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
					{onBack && (
						<button onClick={onBack} className="text-zinc-500 hover:text-zinc-300 transition-colors md:hidden">
							<FaArrowLeft size={14} />
						</button>
					)}
					<div className="min-w-0 flex-1">
						<h2 className="font-semibold tracking-wide text-zinc-200 truncate">{device.name || device.device_id}</h2>
						<p className="text-xs text-zinc-500 truncate">
							{device.device_id}
							{device.location ? ` · ${device.location}` : ""}
						</p>
					</div>
					<span
						className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${
							device.status === "online" ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-500"
						}`}
					>
						{device.status || "unknown"}
					</span>
				</div>

				<div className="flex-1 overflow-auto scrollbar-thin p-4 flex flex-col gap-6">
					<div className="rounded-lg border border-zinc-800 p-4 flex items-center gap-3">
						<div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-orange-500 shrink-0">
							<FaWifi size={16} />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-xs text-zinc-500">Current network</p>
							<p className="text-sm text-zinc-200 truncate">{currentSsid || "Not connected"}</p>
						</div>
						<button
							onClick={handleCheckStatus}
							className="text-xs text-zinc-500 hover:text-orange-500 transition-colors border border-zinc-800 rounded-md px-2 py-1"
						>
							Check status
						</button>
					</div>

					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-zinc-400 tracking-wide">Available networks</h3>
							<button
								onClick={handleScan}
								disabled={scanning}
								className="flex items-center gap-2 text-xs text-zinc-300 hover:text-orange-500 transition-colors border border-zinc-800 rounded-md px-3 py-1.5 disabled:opacity-50"
							>
								<FaSyncAlt className={scanning ? "animate-spin" : ""} size={12} />
								{scanning ? "Scanning…" : "Scan for Wi-Fi"}
							</button>
						</div>

						{scanError && <p className="text-xs text-red-400">{scanError}</p>}

						{networks.length > 0 && (
							<div className="h-full flex flex-col divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-auto">
								{networks.map((n) => {
									const open = isOpenNetwork(n);
									const isCurrent = n.current || n.ssid === currentSsid;
									const isSelected = selectedSsid === n.ssid;
									const isExpanded = expandedSsid === n.ssid;
									const authLabel = AUTHMODE_LABELS[n.authmode] ?? (open ? "Open" : "Secured");

									return (
										<div key={n.ssid} className={isSelected ? "bg-zinc-800/80" : ""}>
											<button
												onClick={() => selectNetwork(n)}
												className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/60`}
											>
												<FaWifi size={13} className={isSelected ? "text-orange-500" : "text-zinc-500"} />
												<span className="text-sm text-zinc-200 flex-1 truncate flex items-center gap-2">
													{n.ssid}
													{isCurrent && (
														<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 shrink-0">
															connected
														</span>
													)}
												</span>
												{open ? (
													<FaLockOpen size={11} className="text-zinc-600" />
												) : (
													<FaLock size={11} className="text-zinc-600" />
												)}
												<SignalBars rssi={n.rssi} />
												<span
													onClick={(e) => toggleDetails(n.ssid, e)}
													className="text-zinc-600 hover:text-zinc-300 pl-1"
												>
													{isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
												</span>
											</button>

											{isExpanded && (
												<div className="px-3 pb-3 pl-9 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-500">
													<span>Security: <span className="text-zinc-300">{authLabel}</span></span>
													<span>Signal: <span className="text-zinc-300">{n.rssi ?? "—"} dBm</span></span>
													<span>Channel: <span className="text-zinc-300">{n.channel ?? "—"}</span></span>
													<span>BSSID: <span className="text-zinc-300">{n.bssid || "—"}</span></span>
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}

						{!scanning && networks.length === 0 && !scanError && (
							<p className="text-xs text-zinc-600">No scan yet — tap "Scan for Wi-Fi" to look for nearby networks.</p>
						)}
					</div>

					{selectedSsid && (
						<div className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
							<p className="text-sm text-zinc-300">
								Connect <span className="text-orange-500">{device.name || device.device_id}</span> to{" "}
								<span className="text-zinc-100">{selectedSsid}</span>
							</p>

							{selectedIsOpen ? (
								<p className="text-xs text-zinc-500">This network is open — no password needed.</p>
							) : (
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Wi-Fi password"
										autoFocus
										className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 pr-10 text-sm text-zinc-200 outline-none focus:border-orange-500/60 transition-colors"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((s) => !s)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
									>
										{showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
									</button>
								</div>
							)}

							<button
								onClick={handleConnect}
								disabled={connecting || (!selectedIsOpen && !password)}
								className="self-start bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-zinc-950 text-sm font-medium rounded-md px-4 py-2 transition-colors"
							>
								{connecting ? "Connecting…" : "Connect"}
							</button>
						</div>
					)}

					{connectionStatus && (
						<div className="flex items-center gap-2 text-sm">
							{connectionStatus === "connecting" && (
								<>
									<FaSpinner className="animate-spin text-zinc-500" size={14} />
									<span className="text-zinc-400">Connecting to {selectedSsid}…</span>
								</>
							)}
							{connectionStatus === "connected" && (
								<>
									<FaCheckCircle className="text-green-500" size={14} />
									<span className="text-green-400">Connected to {currentSsid || selectedSsid}</span>
								</>
							)}
							{connectionStatus === "failed" && (
								<>
									<FaTimesCircle className="text-red-500" size={14} />
									<span className="text-red-400">Couldn't connect. Check the password and try again.</span>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Wifi;