import { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { VscArrowUp } from "react-icons/vsc";
import { sendToAgent } from "../../services/deviceService";
import { BsEmojiWink, BsWifi, BsWifi1, BsWifi2, BsWifiOff } from "react-icons/bs";
import Settings from "./setting";
import { Settings2 } from "lucide-react";

const WIFI_FRAMES = [<BsWifi1 />, <BsWifi2 />, <BsWifi />];
const FRAME_INTERVAL_MS = 400;

const AgentInput = ({ value, onChange, onSend, connected, connectionStatus, current_model }) => {
	const textareaRef = useRef(null);

	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			onSend(current_model);
			event.target.style.height = `40px`;
		}
	};

	const handleSendClick = () => {
		onSend(current_model);
		if (textareaRef.current) {
			textareaRef.current.style.height = `40px`;
		}
	};

	const handleInput = (event) => {
		const textarea = event.target;
		textarea.style.height = "auto";
		const maxHeight = 128;
		const newHeight = Math.min(textarea.scrollHeight, maxHeight);
		textarea.style.height = `${newHeight}px`;

		onChange(textarea.value);
	};

	return (
		<div className="sticky bottom-3 w-full z-50 flex flex-col items-center px-2 overflow-visible">
			<div className="max-w-3xl w-full mx-auto">
				<ConnectionStatusIcon connectionStatus={connectionStatus}/>
			</div>
			<div className="w-full max-w-3xl backdrop-blur-md shadow-md hover:shadow-black/80 shadow-black/60 mx-auto flex flex-col gap-1 items-end rounded-xl border border-zinc-800/40 bg-zinc-900/70 px-3 py-2 hover:border-orange-500/50 focus-within:border-orange-500/60 transition-colors">
				<textarea
					ref={textareaRef}
					value={value}
					onChange={handleInput}
					onKeyDown={handleKeyDown}
					placeholder="Ask the agent..."
					className="w-full flex resize-none bg-transparent px-2 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 hide-scrollbar"
				/>
				<div className="w-full flex flex-row items-center">
					{/* <button
						className="mb-1 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-500/10 hover:text-zinc-400"
						title="Attach"
					>
						<FiPaperclip size={17} />
					</button> */}
					
					<div className="flex flex-wrap gap-1 items-center px-4 overflow-auto hide-scrollbar mr-2">
						<div className={`flex flex-row gap-1 justify-center capitalize text-[10px] px-2 p-1 rounded ${connected ? "text-green-400" : "text-red-500 bg-red-400/10"}`}>
						    <span>
								{connected ?
								<BsWifi className="h-4 w-4"/>
								:
								<BsWifiOff className="h-4 w-4"/>
							    }
							</span>
							{!connected && "disconnected"}
						</div>
					</div>
					<button
						onClick={handleSendClick}
						disabled={!value.trim()}
						className="ml-auto mb-1 rounded-md bg-orange-700 p-2 disabled:text-zinc-500 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-500/10"
						title="Send"
					>
						<VscArrowUp size={16} />
					</button>
					
				</div>
				
			</div>
			
		</div>
	);
};


function ConnectionStatusIcon({ connectionStatus }) {
    const [frame, setFrame] = useState(0);

    const isConnecting = 
        connectionStatus === "connecting" || connectionStatus === "reconnecting";

    useEffect(() => {
        if (!isConnecting) {
            setFrame(0);
            return;
        }

        const id = setInterval(() => {
            setFrame((f) => (f + 1) % WIFI_FRAMES.length);
        }, FRAME_INTERVAL_MS);

        return () => clearInterval(id);
    }, [isConnecting]);
    if (!isConnecting) return null;
    return (
		<div className="backdrop-blur-md w-fit ml-2 px-2 text-xs mr-auto bg-yellow-500/15 p-1 flex items-center rounded-t text-yellow-500">
            <span>{WIFI_FRAMES[frame]}</span>
			<span className="px-2">{connectionStatus}</span>
		</div>
	)
}


export default AgentInput;