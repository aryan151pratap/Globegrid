import { useState } from "react";
import { sendToBackend } from "../../services/deviceService.js";
import { VscChevronRight } from "react-icons/vsc";
import { useNotify } from "./notify.jsx";
import { save_file, save_project } from "../../hooks/projectHandle.js";

const CHUNK_SIZE = 512;

const WriteFile = function ({ activeFile, currentDevice, setFileTrigger, activeProject }) {
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [progress, setProgress] = useState({ sent: 0, total: 0 });

	const notify = useNotify();

	const isLoading = activeFile && activeFile.totalLines > 0 && activeFile.currentLine < activeFile.totalLines;
	const isSaving = saving && progress.total > 0;

	const saveDeviceFile = async () => {
		if (!activeFile || saving) return;
		setSaving(true);
		setError(null);

		const content = activeFile.content || "";
		const chunks = [];
		for (let i = 0; i < content.length; i += CHUNK_SIZE) {
			chunks.push(content.slice(i, i + CHUNK_SIZE));
		}
		setProgress({ sent: 0, total: chunks.length });

		try {
			sendToBackend({
				type: "filesystem",
				operation: "write_file_start",
				path: activeFile.path,
				device_id: currentDevice
			});

			for (let i = 0; i < chunks.length; i++) {
				sendToBackend({
					type: "filesystem",
					operation: "write_file",
					path: activeFile.path,
					data: chunks[i],
					device_id: currentDevice,
				});
				setProgress({ sent: i + 1, total: chunks.length });
			}

			sendToBackend({
				type: "filesystem",
				operation: "write_file_end",
				path: activeFile.path,
				device_id: currentDevice
			});
		} catch (err) {
			console.log(err);
			setError(err?.message || "Failed to save file");
		} finally {
			setSaving(false);
		}
	};

	const saveProjectFile = async function(){
		try{
			if(!activeProject?.id) return;
			else if(activeProject?.id !== activeFile?.projectId) return notify({type: "warning", message: `${activeFile?.name} not from ${activeProject?.name}`});
			const res = await save_file(activeProject?.id, activeFile);
			if(!res) notify({type: "error", message: "saving failed"}); 
			notify({type: "status", message: res.message});
		} catch (err) {
			notify({type: "error", message: err});
		}
	}

	const handleSave = async () => {
		try{
			const origin = activeFile?.origin;
			if(origin == "device") await saveDeviceFile();
			else if(origin == "project") await saveProjectFile();
			else {
				notify({type: "error", message: `invalid origin - ${origin}`});
			}
		} catch (err) {
			notify({type: "error", message: err});
		}
	}

	return (
		<div className="bg-zinc-800/50 backdrop-blur-sm h-6 border-zinc-800 w-full flex flex-row items-center text-white overflow-hidden p-0.5">
			<div className={`${activeFile ? "opacity-100" : "hidden"} shrink-0 group-hover:opacity-100 transition text-white text-xs p-1 text-zinc-400 px-2 border-r border-zinc-800 overflow-auto`}>
				<div className="flex flex-row items-center overflow-auto hide-scrollbar">
					{activeFile?.path?.split("/").slice(1,).map((i, index) => (
						<div key={index} className="shrink-0 flex flex-row items-center">
							<span>{i}</span>
							<span className="text-green-500 px-0.5">
								<VscChevronRight/>
							</span>
						</div>
					))}
				</div>	
			</div>
			<div className="w-full p-2 text-white">
				{isLoading && (
					<div className="p-2 text-white text-sm flex flex-row items-center gap-2">
						<span className="shrink-0 text-xs text-zinc-400">Loading {activeFile.currentLine} / {activeFile.totalLines}</span>
						<div className="w-full h-1 bg-zinc-700 rounded">
							<div
								className="h-1 bg-purple-500/60 rounded"
								style={{ width: `${(activeFile.currentLine / activeFile.totalLines) * 100}%` }}
							/>
						</div>
					</div>
				)}
				{!isLoading && isSaving && (
					<div className="p-2 text-white text-sm flex flex-row items-center gap-2">
						<span className="shrink-0 text-xs text-zinc-400">Saving {progress.sent} / {progress.total}</span>
						<div className="w-full h-1 bg-purple-700 rounded">
							<div
								className="h-1 bg-zinc-500/60 rounded"
								style={{ width: `${(progress.sent / progress.total) * 100}%` }}
							/>
						</div>
					</div>
				)}
			</div>
			<div className="shrink-0 h-full flex items-center gap-2 ml-auto overflow-hidden">
				<button
					onClick={handleSave}
					disabled={!activeFile || saving}
					className="capitalize text-xs px-2 p-2 bg-[#CEF144] text-black hover:bg-[#CEF144]/90 hover:text-zinc-500 cursor-pointer rounded disabled:opacity-80 disabled:cursor-not-allowed border-l border-zinc-800"
				>
					{saving ? "Saving..." : activeFile?.origin === "device" ? "Save device file" : "Save ui file"}
				</button>
				{error && <span className="text-[11px] text-red-400">{error}</span>}
			</div>
		</div>
	);
};

export default WriteFile;