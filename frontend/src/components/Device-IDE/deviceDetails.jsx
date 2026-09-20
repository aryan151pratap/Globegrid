import { useEffect, useState } from "react";
import { FaConnectdevelop, FaWifi } from "react-icons/fa";
import { BsWifi, BsWifiOff } from "react-icons/bs";
import { VscChevronDownCompact, VscChip, VscDebugConnected, VscDebugDisconnect } from "react-icons/vsc";

const DeviceDetails = function({devices, setCurrentDevice, currentDevice}){
	const [current, setCurrent] = useState();
	return(
		<div className="h-full flex flex-col w-full border-t-1 border-zinc-800 mt-auto">
			<div className="h-full w-full flex flex-col text-[13px] text-zinc-400 overflow-auto dark-scrollbar">
				{devices?.map((i, index) => {
					const conn = i.status === "online" && currentDevice == i.device_id;
					return (<div key={index} className="h-fit flex flex-col">
						<div className="h-full w-full capitalize flex flex-row items-center border-r border-zinc-800">
							<div className={`shrink-0 border-r-0 ${i.status === "online" ? "bg-sky-400/10 border-zinc-800" : "bg-red-400/10 border-zinc-800"} p-1`}>
								{i.status === "online" ?
									<BsWifi className="text-sky-500 h-4 w-5"/>
									:
									<BsWifiOff className="text-red-500 h-4 w-5"/>			
								}
							</div>
							<span className={`flex flex-row gap-2 border-b border-zinc-400/5 items-center ${i.status === "online" ? "bg-zinc-400/5" : "bg-zinc-400/5"} hover:text-zinc-300 w-full p-0.5 px-1 hover:bg-zinc-400/8 cursor-pointer`}
								onClick={() => {
									if(current === i.device_id) setCurrent();
									else setCurrent(i.device_id);
								}}
							>
								<span>{i.location} </span>
								<span>({i.name})</span>
							</span>
							<div className={`${conn ? " bg-green-400/10 hover:bg-green-500/10" : "bg-red-400/10 hover:bg-red-500/10"} px-2 h-full flex items-center cursor-pointer`}
								onClick={() => setCurrentDevice(i.device_id)}
							>
								{conn ?
									<VscDebugConnected className="text-green-500"/>
									:
									<VscDebugDisconnect className="text-red-500"/>
								}
							</div>
						</div>
						<div>
							{current === i.device_id &&
								<ShowDevices data={i}/>
							}
						</div>
					</div>			
				)})}
				
				<div className="mb-2"/>
			</div>
		</div>		
	)
}

function ShowDevices({data}){
	const humanize = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	const HEADER_KEYS = ["device_id", "device_name", "status"];
	const STATUS_COLOR = {
		online: "bg-emerald-400",
		offline: "bg-rose-400",
		idle: "bg-amber-400",
	};

	const rows = Object.keys(data).filter((k) => !HEADER_KEYS.includes(k));
	
	return(
		<div className="bg-neutral-950 flex items-center justify-center">
			<div className="w-full border-r border-zinc-800 bg-neutral-900">
				<div className="flex items-center justify-between p-2 border-b border-white/10">
					<div>
						<div className="text-sm font-medium text-neutral-100">{data.device_name}</div>
						<div className="text-xs text-neutral-500">{data.device_id}</div>
					</div>
					<div className="flex items-center gap-1.5 text-xs text-neutral-300">
						<span className={`h-2 w-2 rounded-full ${STATUS_COLOR[data.status] || "bg-neutral-500"}`} />
						{humanize(data.status || "unknown")}
					</div>
				</div>

				<div className="divide-y divide-white/5">
					{rows.map((key) => (
						<div key={key} className="flex items-center justify-between p-1 px-3 text-xs">
							<span className="text-neutral-500">{humanize(key)}</span>
							<span className="text-neutral-200 text-right">
								{Array.isArray(data[key]) ? data[key].join(", ") : String(data[key])}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}


export default DeviceDetails;