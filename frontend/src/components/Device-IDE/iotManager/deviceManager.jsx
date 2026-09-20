import { useState } from "react";
import { VscChevronRight, VscRefresh } from "react-icons/vsc";
import FileManager from "./fileManager";
import { useNotify } from "../notify";
import { handleCreateDeviceFile, handleDeleteDeviceFile } from "../../../hooks/fileHandle";

export default function DeviceManager({
	files,
	setFiles,
	activeFile,
	onFileSelect,
	onLoadFolder,
	setFileTrigger,
	currentDevice
}) {
	const [currentFolder, setCurrentFolder] = useState("/");
	const [createFile, setCreateFile] = useState(false);
	const [input, setInput] = useState("");
	const [entry_type, setEntry_type] = useState("file");
	const notify = useNotify();

	const handleRefresh = function () {
		setFileTrigger((e) => e + 1);
		notify({ type: "status", message: "refreshing..." });
	};

	const handleCreate = async function () {
		try {
			handleCreateDeviceFile(currentDevice, entry_type, input, currentFolder);
			setCreateFile(false);
			setInput("");
		} catch (err) {
			console.log(err.message);
			notify({ type: "error", message: err.message });
		}
	};

	const handleDelete = async function (path) {
		try {
			if (currentFolder == path) setCurrentFolder("/");
			handleDeleteDeviceFile(currentDevice, entry_type, path);
			setFiles([]);
			setFileTrigger((e) => e + 1);
			setCreateFile(false);
		} catch (err) {
			console.log(err.message);
			notify({ type: "error", message: err.message });
		}
	};

	return (
		<div className="flex-1 min-h-0 flex flex-col">
			{currentFolder && (
				<div className="w-full bg-zinc-500/10 flex flex-row text-xs text-zinc-400 overflow-auto hide-scrollbar shrink-0">
					{currentFolder?.split("/").filter(Boolean).map((i, index) => (
						<div key={index} className="shrink-0 p-1 px-2 flex flex-row items-center">
							<span>{i}</span>
							<span className="text-green-500 p-0.5 px-1">
								<VscChevronRight />
							</span>
						</div>
					))}
				</div>
			)}
			{createFile && (
				<div className="w-full items-center shrink-0 flex flex-row bg-zinc-500/10 p-1">
					<input
						type="text"
						value={input}
						placeholder="Enter file name..."
						onChange={(e) => setInput(e.target.value)}
						className="w-fit min-w-0 px-2 p-0.5 outline-none placeholder:text-zinc-500 bg-zinc-900 text-xs border border-zinc-500/20 focus:border-purple-500/80"
					/>
					<div className="flex items-center px-1 ml-auto">
						<select
							className="bg-zinc-700/50 hover:bg-purple-500/80 text-xs p-0.5 outline-none cursor-pointer"
							value={entry_type}
							onChange={(e) => setEntry_type(e.target.value)}
						>
							<option value="folder" className="bg-zinc-800">folder</option>
							<option value="file" className="bg-zinc-800">file</option>
						</select>
					</div>
					<button
						className="text-xs p-0.5 px-2 bg-zinc-700/50 hover:bg-purple-500/60"
						onClick={() => handleCreate()}
					>
						save
					</button>
				</div>
			)}

			<div className="flex-1 min-h-0 overflow-y-auto dark-scrollbar">
				<FileManager
					files={files}
					activeFile={activeFile}
					onFileSelect={onFileSelect}
					currentFolder={currentFolder}
					onFolderChange={setCurrentFolder}
					onLoadFolder={onLoadFolder}
					handleDelete={handleDelete}
				/>
			</div>

			<div className="p-1 w-fit rounded shrink-0">
				<div
					className="px-2 p-1 text-xs flex flex-row items-center gap-2 bg-zinc-800/60 hover:bg-purple-500/80 hover:text-white cursor-pointer text-zinc-400 capitalize border border-zinc-900"
					onClick={() => handleRefresh()}
				>
					<VscRefresh />
					<span>refresh</span>
				</div>
			</div>
		</div>
	);
}