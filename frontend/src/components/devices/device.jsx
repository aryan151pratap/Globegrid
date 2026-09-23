import { useEffect, useState } from "react";
import Find from "./find";
import ScanningCard from "./scan";
import DeviceSearch from "./search";
import { AddedDevice, getDevices } from "../../services/iotService";
import SaveDevice from "./saveDevice";
import DeviceCard from "./deviceCard";

const Devices = function(){
	const [search, setSearch] = useState("");
	const [devices, setDevices] = useState([]);
	const [addingId, setAddingId] = useState(null);
	const [filter, setFilter] = useState(devices);
	const [addedDevice, setAddedDevice] = useState([]);
	const [scanning, setScanning] = useState(false);
	const [message, setMessage] = useState(null);
	const [triggeer, setTrigger] = useState(0);

	useEffect(() => {
		getIOTDevices();
		getAddedDevice();
	}, [addingId, triggeer]);


	const getAddedDevice = async function(){
		try{
			const data = await AddedDevice();
			setAddedDevice(data);
		} catch (err) { 
			console.log(err);
		}
	}

	const getIOTDevices = async function(){
		try {
			setScanning(true);
			const data = await getDevices();
			if (data) setDevices(data?.devices);
		} catch (err) {
			console.log(err);
		} finally {
			setScanning(false);
		}
	}


	useEffect(() => {
		if(devices.length == 0) return;
		const filtered = devices?.filter((d) =>
			`${d.name || ""} ${d.device_id}`.toLowerCase().includes(search.toLowerCase())
		);
		setFilter(filtered)
	}, [search, devices])

	return(
		<div className="w-full h-full flex md:flex-row sm:flex-col flex-col overflow-auto dark-scrollbar">
			<div className="w-full h-full flex flex-col overflow-auto scrollbar-thin">
				<DeviceSearch value={search} onChange={setSearch}/>
				{devices.length > 0?				
					<Find 
						devices={filter} 
						addingId={addingId} 
						setAddingId={setAddingId}
					/>
					:
					<ScanningCard scanning={scanning} onRescan={getIOTDevices}/>
				}
				<div className={`${addedDevice?.length == 0 ? "hidden" : "flex"} group flex-col h-full w-full p-4 text-zinc-200 overflow-auto`}>
					<div className="w-fit">
						<h2 className="border-b-2 border-zinc-100/0 group-hover:border-orange-500/80 group-hover:text-zinc-400 transition-colors mb-4 font-semibold tracking-wide text-zinc-500">Added Devices</h2>
					</div>
					<div className="w-full flex flex-wrap gap-2 overflow-auto scrollbar-thin hide-scrollbar">
						{addedDevice?.map((i, index) => (
							<DeviceCard data={i} setTrigger={setTrigger}/>
						))}
					</div>
				</div>
			</div>

			<div className={`${!addingId ? "hidden" : "flex"} w-full h-full sm:border-t md:border-t-0 md:border-l border-zinc-800 overflow-auto scrollbar-thin`}>
				<SaveDevice addingId={addingId} setAddingId={setAddingId}/>
			</div>
		</div>
	)
}

export default Devices;