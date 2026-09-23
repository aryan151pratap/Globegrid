import { use, useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { FiRefreshCcw, FiTerminal } from "react-icons/fi";
import { VscClose } from "react-icons/vsc";
import { getFileIcon } from "./fileIcons";

const FileHeader = function ({files, openExplorer, setOpenExplorer, activeFile, setActiveFile, setOpenTerminal, handleReconnect, activeProject}) {

	const [activesFiles, setActivesFiles] = useState([]);

	useEffect(() => {
		if(!activeFile) return;
		setActivesFiles((prev) => {
			const exists = prev.some((i) => i.name === activeFile.name);
			if(!exists) return [...prev, activeFile];
			return prev.map((i) =>
				i.name === activeFile.name ? { ...i, ...activeFile } : i
			);
		});
	}, [activeFile])

	const handleCloseTab = (e, file) => {
		e.stopPropagation();
		setActivesFiles((prev) => {
			const remaining = prev.filter((i) => i.name !== file.name);
			if (activeFile?.name === file.name) {
				setActiveFile(remaining.length ? remaining[remaining.length - 1] : null);
			}
			return remaining;
		});
	};

	return (
		<div className="w-full flex h-10 items-center border-b border-zinc-800 bg-[#0d0d0f]">
			{!openExplorer && (
				<button
					onClick={() => setOpenExplorer(true)}
					className="h-full p-3 text-zinc-500 border-r border-zinc-800 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
					title="Open Explorer"
				>
					<CiMenuBurger size={17} />
				</button>
			)}
			<div className="w-full flex flex-row h-full items-center">
				{activesFiles.length > 0 &&
				<div className="h-full items-center flex flex-row text-white text-sm text-zinc-200 overflow-auto hide-scrollbar">
					{activesFiles.map((i, index) => (
						<div key={index} className={`relative inset-0 h-full items-center flex gap-2 px-2 cursor-pointer ${activeFile?.name == i.name ? "bg-zinc-800/50" : "hover:bg-zinc-400/20 border-r border-zinc-800 text-zinc-400 hover:text-white"}`}
							onClick={() => setActiveFile(i)}
						>
							{getFileIcon(i?.name, 16)}
							<span className={`${activeProject?.id !== i.projectId && i?.origin == "project" ? "italic text-zinc-400" : ""} flex flex-col`}>
								<span className="text-[13px]">{i?.name}</span>
								<span className="absolute top-[19px] text-[8px] capitalize font-semibold underline">{i?.origin === "device" ? "device_explorer" : activeProject?.id && activeProject?.name}</span>
							</span>
							<button
								className="font-thin cursor-pointer hover:bg-zinc-500/20 p-1"
								onClick={(e) => handleCloseTab(e, i)}
							>
								<VscClose/>
							</button>
						</div>
					))}
				</div>
				}
				<div className="h-full border-l border-zinc-500/20 p-1.5 ml-auto flex flex-row gap-2">
					<button 
						className="flex flex-row items-center gap-2 text-zinc-400 bg-zinc-500/20 text-xs px-2 p-1 hover:bg-purple-500/70 hover:text-white capitalize"
						onClick={() => handleReconnect()}
					>
						<FiRefreshCcw/>
						<span>reconnect</span>
					</button>
					<button className={'ml-auto h-full text-xs text-white px-2 p-1.5 flex flex-row items-center gap-1 bg-zinc-500/20 hover:bg-purple-500/80 hover:text-white text-zinc-400 cursor-pointer'}
						onClick={() => setOpenTerminal(e => !e)}
					>
						<FiTerminal className=""/>
						<span>Terminal</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default FileHeader;