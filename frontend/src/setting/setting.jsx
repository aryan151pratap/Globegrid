import { useEffect, useState } from "react";
import { FaWifi, FaMicrochip, FaChevronRight } from "react-icons/fa";
import { AddedDevice } from "../services/iotService";
import { Wifi } from "./wifi";

const Setting = function () {
	const [devices, setDevices] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState(null);

	useEffect(() => {
		getAddedDevices();
	}, []);

	const getAddedDevices = async function () {
		try {
			setLoading(true);
			const data = await AddedDevice();
			setDevices(data || []);
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full h-full flex md:flex-row flex-col overflow-auto dark-scrollbar">
			<div className="w-full h-full md:w-80 flex flex-col md:border-b-0 md:border-r border-zinc-800 overflow-auto scrollbar-thin">
				<div className="px-4 py-3 border-b border-zinc-800">
					<h2 className="font-semibold tracking-wide text-zinc-300">Devices</h2>
					<p className="text-xs text-zinc-500">Select a device to manage its Wi-Fi</p>
				</div>

				{loading ? (
					<div className="p-4 text-sm text-zinc-500">Loading devices…</div>
				) : devices.length === 0 ? (
					<div className="p-4 text-sm text-zinc-500">No devices added yet.</div>
				) : (
					<div className="flex flex-col divide-y divide-zinc-800">
						{devices.map((d) => (
							<button
								key={d.device_id}
								onClick={() => setSelectedDevice(d)}
								className={`flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/60 ${
									selectedDevice?.device_id === d.device_id ? "bg-zinc-800/80" : ""
								}`}
							>
								<div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center text-orange-500">
									<FaMicrochip size={16} />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm text-zinc-200 truncate">{d.name || d.device_id}</p>
									<p className="text-xs text-zinc-500 truncate">{d.device_id}</p>
								</div>
								<span
									className={`w-2 h-2 rounded-full shrink-0 ${
										d.status === "online" ? "bg-green-500" : "bg-zinc-600"
									}`}
								/>
								<FaChevronRight className="text-zinc-600 shrink-0" size={12} />
							</button>
						))}
					</div>
				)}
			</div>

			<div className="w-full h-full overflow-auto scrollbar-thin">
				{selectedDevice ? (
					<Wifi device={selectedDevice} onBack={() => setSelectedDevice(null)} />
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-600">
						<FaWifi size={28} />
						<p className="text-sm">Select a device to configure Wi-Fi</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Setting;