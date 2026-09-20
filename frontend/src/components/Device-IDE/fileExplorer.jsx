import { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import DeviceDetails from "./deviceDetails";
import { AddedDevice } from "../../services/iotService";
import { useNotify } from "./notify";
import { VscChevronDownCompact, VscChevronRight, VscChip } from "react-icons/vsc";
import DeviceManager from "./iotManager/deviceManager";
import {data} from "../project_ui/data";
import CodeExplorer from "./ui_code/codeExplorer";

export default function FileExplorer({
	files,
	setFiles,
	activeFile,
	onFileSelect,
	setOpenExplorer,
	setCurrentDevice,
	currentDevice,
	trigger,
	onLoadFolder,
	setFileTrigger,

	handleCodeFileSelect,
	activeProject,
	setActiveProject
}) {
	const [devices, setDevices] = useState([]);
	const notify = useNotify();
	const [openOption, setOpenOption] = useState({device_manager: false, frontend_ui: true, device: true});
	const [loading, setLoading] = useState({device_manager: false, frontend_ui: false, device: false})

	useEffect(() => {
		const getAddedDevice = async function () {
			try {
				setLoading((e) => ({...e, device: true}));
				const data = await AddedDevice();
				if (!data) return;
				setDevices(data);
			} catch (err) {
				console.log(err);
			} finally {
				setLoading((e) => ({...e, device: false}));
			}
		};
		getAddedDevice();
	}, [trigger]);

	useEffect(() => {
		if (devices.length == 0) return;
		const device = localStorage.getItem("currentDevice");
		if (!device) return;
		const findDevice = devices.find((item) => item.device_id === device && item.status === "online");
		if (findDevice) setCurrentDevice(device);
		else localStorage.removeItem("currentDevice");
	}, [devices]);

	const handleOption = function (key) {
		setOpenOption((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const sections = [
		{
			key: "device_manager",
			label: "device manager",
			icon: VscChip,
			render: () => (
				<DeviceManager
					files={files}
					setFiles={setFiles}
					activeFile={activeFile}
					onFileSelect={onFileSelect}
					onLoadFolder={onLoadFolder}
					setFileTrigger={setFileTrigger}
					currentDevice={currentDevice}
				/>
			)
		},
		{
			key: "frontend_ui",
			label: "Frontend UI",
			icon: VscChip,
			render: () =>	(
				<div className="flex-1 min-h-0 overflow-y-auto dark-scrollbar">
					<CodeExplorer
						files={data}
						activeFile={activeFile}
						onFileClick={handleCodeFileSelect}
						activeProject={activeProject}
						setActiveProject={setActiveProject}
					/>
				</div>
			)
		},
		{
			key: "device",
			label: "Devices",
			icon: VscChip,
			render: () => (
				<DeviceDetails
					devices={devices}
					setCurrentDevice={setCurrentDevice}
					currentDevice={currentDevice}
				/>
			)
		}
	];

	return (
		<aside className="relative flex flex-col h-full w-60 min-h-0 bg-[#0d0d0f] border-r border-zinc-800 text-zinc-300">
			<div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800">
				<div className="flex items-center gap-2">
					<button
						onClick={() => setOpenExplorer(false)}
						className="p-3 text-zinc-500 transition hover:bg-zinc-800 hover:text-white border-r border-zinc-800"
						title="Close Explorer"
					>
						<CiMenuBurger size={17} />
					</button>
					<span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
						Explorer
					</span>
				</div>
			</div>

			{sections.map(({ key, label, icon: Icon, render }, index) => {
				const isOpen = openOption[key];
				return (
					<div
						key={index}
						className={`relative flex flex-col border-t border-zinc-800 ${index == 0 && "border-t-0"} ${
							isOpen ? "flex-1 min-h-0 basis-0" : "shrink-0"
						}`}
					>
						<div
							className="shrink-0 w-full flex items-center px-2 border-zinc-800/50 font-semibold cursor-pointer hover:bg-zinc-500/10"
							onClick={() => handleOption(key)}
						>
							<span>{isOpen ? <VscChevronDownCompact /> : <VscChevronRight />}</span>
							<span className="uppercase p-2 flex gap-2 items-center text-xs">
								<Icon className="h-4 w-4" />
								<span>{label}</span>
							</span>
						</div>
						{isOpen && loading[key] &&
						<div className="h-full w-full flex flex-col items-center justify-center">
							<div className="w-fit p-2 rounded-full border-2 border-t-transparent border-purple-500 animate-spin"></div>
						</div>
						}
						{isOpen && render()}
					</div>
				);
			})}
		</aside>
	);
}