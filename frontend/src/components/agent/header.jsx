import { useState } from "react";
import {FiSend,FiPlus,FiPaperclip,FiTrash2,FiMoreHorizontal} from "react-icons/fi";
import { FaCode } from "react-icons/fa";
import { VscCode, VscLayoutPanelDock, VscLayoutSidebarRightDock } from "react-icons/vsc";
import ConnectDevice from "./connectDevice";

const AgentHeader = ({ onClear, codePreview, setCodePreview, showCodePreview, setShowCodePreview, details, setShowModels }) => {
	const [connectDevices, setConnectDevices] = useState(false);

	return (
		<header className="shadow-xl bg-black shadow-black relative flex h-10 shrink-0 items-center justify-between overflow-auto hide-scrollbar">
			
			<div className="flex items-center gap-1 px-2 ml-auto">
				<button
					className={`${codePreview ? "bg-zinc-800/50" : ""} p-2 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-200`}
					onClick={() => setCodePreview(e => !e)}
				>
					<VscCode className="font-thin"/>
				</button>
				{codePreview &&
				<div>
					<button className="text-zinc-500 p-2 bg-zinc-800/50 rounded-md hover:bg-zinc-800 hover:text-zinc-200"
						onClick={() => setShowCodePreview(e => !e)}
					>
						{showCodePreview ?
						<VscLayoutSidebarRightDock/>
						:
						<VscLayoutPanelDock/>
						}
					</button>
				</div>
				}
				<button
					className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
					title="New Chat"
					onClick={() => setConnectDevices(e => !e)}
				>
					<FiPlus size={16} />
				</button>
				{connectDevices &&
					<ConnectDevice details={details}/>
				}

				<button
					onClick={onClear}
					className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
					title="Clear Chat"
				>
					<FiTrash2 size={16} />
				</button>

				<button
					className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
					title="More"
					onClick={() => setShowModels((e) => !e)}
				>
					<FiMoreHorizontal size={16} />
				</button>
			</div>
		</header>
	);
};


export default AgentHeader;






