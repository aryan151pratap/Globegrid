import { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { VscArrowUp } from "react-icons/vsc";
import { sendToAgent } from "../../services/deviceService";
import { BsEmojiWink, BsWifi, BsWifi1, BsWifi2, BsWifiOff } from "react-icons/bs";

const WIFI_FRAMES = [<BsWifi1 />, <BsWifi2 />, <BsWifi />];
const FRAME_INTERVAL_MS = 400;

const AgentInput = ({ value, onChange, onSend, connected, models, connectionStatus, device_connection, details }) => {
	const [showModels, setShowModels] = useState(false);
	const [current_model, setCurrent_model] = useState("");
	const [showDetails, setShowDetails] = useState(false);
	const textareaRef = useRef(null);

	useEffect(() => {
		setCurrent_model(models?.default);
	}, [models])

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
	const handleSelectModel = function(i){
		if(!connected) return;
		sendToAgent({
			type: "change_model",
			model: i
		})
		setCurrent_model(i);
		setShowModels(false);
	}

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
					<button
						className="mb-1 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-500/10 hover:text-zinc-400"
						title="Attach"
					>
						<FiPaperclip size={17} />
					</button>
					
					<div className="flex flex-wrap gap-1 items-center px-4 overflow-auto hide-scrollbar mr-2">
						<div className={`flex flex-row gap-1 justify-center capitalize text-[10px] px-2 p-1 rounded ${connected ? "text-green-400 bg-green-500/20" : "text-red-500 bg-red-400/10"}`}>
						    <span>
								{connected ?
								<BsWifi className="h-4 w-4"/>
								:
								<BsWifiOff className="h-4 w-4"/>
							    }
							</span>
							{!connected && "disconnected"}
						</div>
						{/* <div className="ml-2 text-xs text-zinc-500">
							{device_connection ? `Connected to: ${device_connection}` : "No device connected"}
							</div> */}
						<ModelSelector
							showModels={showModels}
							setShowModels={setShowModels}
							current_model={current_model}
							models={models}
							handleSelectModel={handleSelectModel}
							details={details}
						/>
						{details &&
						<div className="text-[10px] flex flex-wrap gap-1">
							<span className={`${showDetails ? "bg-purple-500/15" : "bg-zinc-500/20"} capitalize px-2 p-1 hover:text-white hover:bg-purple-500/20 cursor-pointer rounded`}
								onClick={() => setShowDetails(e => !e)}
							>
								{details?.type}
							</span>
							<div className={`${showDetails ? "flex" : "hidden"}`}>
								<div className="flex flex-wrap gap-1">
									{/* <span className="bg-zinc-500/20 px-2 p-1 rounded">{details?.model}</span> */}
									<span className={`${details?.current_device ? "bg-green-500/10" : "bg-red-500/10"} py-1 rounded overflow-hidden`}>
										<span className="px-2 bg-zinc-300/5 p-1 text-zinc-300/80 capitalize">device</span>
										<span className={`${details?.current_device ? "text-green-300" : "text-red-300"} px-2`}>{details?.current_device ? "connected" : "disconnect"}</span>
									</span>
								</div>
							</div>
						</div>
						}
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


const ModelSelector = ({ showModels, setShowModels, current_model, models, handleSelectModel, details }) => {
	return(
		<div className="shrink-0">
			<div className={`absolute bottom-10 z-50 border border-zinc-800 w-fit min-w-48 flex text-sm bg-zinc-800 mb-2 rounded overflow-hidden ${!showModels ? "hidden" : "flex flex-col"}`}>				
				<div className="sticky top-0 bg-black/50 rounded-t px-2 p-1 capitalize text-zinc-300/80 border-b border-zinc-800/40">
					<div className="flex flex-col text-xs">
						<span>ai models</span>
						<span className="lowercase text-purple-300/60">{current_model}</span>
					</div>
				</div>
				<div className="max-h-[150px] bg-black/70 flex flex-col overflow-auto hide-scrollbar">
					<div className="h-full overflow-auto hide-scrollbar flex flex-col">
						{models?.models?.map((i, index) => (
							<div key={index} className="shrink-0 cursor-pointer text-xs"
								onClick={() => handleSelectModel(i)}
							>
								<div className={`${current_model == i ? "text-zinc-200 bg-zinc-500/20" : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-500/10 bg-zinc-800/20"} p-1 group flex flex-row items-center gap-2 line-clamp-1 capitalize transition`}>
									<span className="px-2 p-0.5 bg-purple-500/15 group-hover:bg-purple-500/10 rounded flex transition font-mon0">
										{index+1}
									</span>
									<span className="shrink-0 w-full mr-2">
										{i}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			{details &&
			<button
				className="border border-white/0 focus:border-purple-500/50 hover:border-purple-500/10 focus:bg-purple-500/10 hover:bg-purple-500/10 max-w-fit min-w-10 bg-zinc-500/10 flex text-xs rounded overflow-hidden"
				onClick={() => setShowModels(e => !e)}
			>
				<span className="capitalize bg-zinc-300/5 px-2 p-1 text-zinc-300/80">{details?.provider}</span>
				<span className="p-1 px-2 line-clamp-1 ">{current_model?.includes("/") ? current_model.split("/")[1] : current_model}</span>
			</button>
			}
		</div>
	)
}

export default AgentInput;