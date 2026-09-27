import { useEffect, useRef, useState } from "react";
import { FiTerminal, FiTrash2, FiX } from "react-icons/fi";
import { getPreviousHistory, getNextHistory } from "../../services/history.js"; 
import { FaRunning, FaTimes } from "react-icons/fa";
import { FileOutput } from "lucide-react";
import { VscBook, VscRunCompact, VscStopCircle } from "react-icons/vsc";
import { handleMouseDown } from "../../services/silde.js";
import { sendToBackend } from "../../services/deviceService.js";

export default function TerminalFile({terminal, setTerminal, onClear, onClose, onSend, iotConn, backend, output, setOutput, activeFile, currentDevice}) {
	const [input, setInput] = useState(""); 
	const inputRef = useRef(null); 
	const {ref: terminalRef, handleScroll} = useAutoScroll(terminal);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [connection, setConnection] = useState();
	const [option, setOption] = useState("terminal");
	const [side, setSide] = useState(false);
	const containerRef = useRef(null);
	const [outputWidth, setOutputWidth] = useState(260);
	
	const options = [
		{
			id: "terminal",
			label: "TERMINAL",
			icon: <FiTerminal size={14} />,
		},
		{
			id: "output",
			label: "OUTPUT",
			icon: <FileOutput size={14} />,
		},
	];

	useEffect(() => {
		setConnection([iotConn, {device_id: "server", status: backend}]);
	}, [backend, iotConn])
	
	const handleKeyDown = (e) => { 
		if (e.key === "Enter" && e.shiftKey) {
			return;
		}
		if (e.key === "Enter") { 
			e.preventDefault(); 
			if (!input.trim()) 
				return; 
			const data = input;
			onSend(data);
			setHistory(prev => [...prev, input]);
			setHistoryIndex(-1);
			if(data == "clear") setTerminal([]);
			setInput(""); 
		} 
		if (e.key === "ArrowUp") {
			e.preventDefault();
			const result = getPreviousHistory(history, historyIndex);
			setHistoryIndex(result.index);
			setInput(result.value);
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			const result = getNextHistory(history, historyIndex);
			setHistoryIndex(result.index);
			setInput(result.value);
		}
	};

	const handleParentClick = () => {
        inputRef.current?.focus();
    };

	return (
		<section onClick={handleParentClick} className="relative group border-t font-mono h-full min-h-0 flex flex-col border-zinc-800 bg-[#09090b] overflow-auto dark-scrollbar">
			<div className="h-fit w-full flex shrink-0 items-center bg-[#111113] overflow-auto hide-scrollbar">
				{options.map((item) => (
					<div
						key={item.id}
						onClick={() => setOption(item.id)}
						className={`
							flex items-center h-full px-2
							border-r border-zinc-800 cursor-pointer
							${option === item.id && !side ? "bg-zinc-900/80 text-white" : "text-zinc-400"}
						`}
					>
						<div
							className={`
								flex items-center gap-2 text-xs
							`}
						>
							{item.icon}
							{item.label}
						</div>
					</div>
				))}
				<div className="h-full border-r border-zinc-800 flex text-white">
					<button className={`${!side ? "text-zinc-400 hover:text-white" : "bg-purple-500/50 text-white"} flex items-center px-2`}
						onClick={() => setSide(e => !e)}
					>
						<VscBook/>
					</button>
				</div>
				<div className="h-full flex flex-row items-center overflow-auto hide-scrollbar">
					{connection?.map((i, index) => (
						<div key={index} className="h-full flex flex-row items-center text-xs text-white border-r border-zinc-800">
							<div className="capitalize flex items-center px-1.5 h-full bg-zinc-500/10 border-r border-zinc-800">
								{i?.device_id ? i?.device_id : "Device"}
							</div>
							{i?.status ? 
								<div className="h-full capitalize flex items-center text-green-500 p-1 px-1.5 font-inter bg-zinc-500/10">connected</div>
								:
								<div className="h-full capitalize flex items-center text-zinc-500 font-inter p-1 px-1.5 bg-zinc-500/10">disconnected</div>
							}
						</div>
					))}
				</div>
				<div className="flex items-center gap-1 ml-auto">
					<button
						onClick={onClose}
						className="p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
					>
						<FiX size={14} />
					</button>
				</div>
			</div>
			<div ref={containerRef} className={`p-1 flex flex-row flex-1 min-h-0 w-full bg-zinc-900/70`}>
				<div ref={terminalRef} onScroll={handleScroll} 
					style={{
						width: side ? `calc(100% - ${outputWidth}px - 4px)` : "100%",
					}}
					className={`${option == "terminal" || side ? "flex" : "hidden"} h-full w-full border-0 border-zinc-800 rounded-md flex flex-col overflow-auto hide-scrollbar p-2 text-xs leading-4`}
				>
					{terminal.map((line, index) => (
						<div
							key={index}
							className={`flex gap-1 break-all font-semibold ${line.type == "error"
									? "text-red-400"
									: line.type == 'terminal_input'
										? "text-zinc-300"
										: line?.color ? `w-fit text-${line.color}-500/80 text-[11px]` : "text-zinc-300"}
							`}
						>
							{line.type == "terminal_input" && 
								<span className="text-blue-500 flex">
									<span>{iotConn?.device_id}:</span>
									<span className="text-white">
										<span className="text-blue-500 font-bold">/</span>
										<span className="mr-1">$</span>
									</span> 
								</span>
							}
							<pre className="flex text-wrap break-words break-all">{line?.data}</pre>
						</div>
					))}
					<div className="h-full flex"> 
						<span className="text-green-500">{iotConn?.device_id}:</span>
						<span className="text-white">
							<span className="text-blue-500 font-bold">/</span>
							<span className="mr-2">$</span>
						</span> 
						<textarea ref={inputRef} value={input} 
							onChange={(event) => setInput(event.target.value)} 
							onKeyDown={handleKeyDown} 
							autoFocus 
							rows={10}
							className="h-full resize-none flex-1 bg-transparent text-white outline-none dark-scrollbar" 
							spellCheck={false} 
						/> 
					</div>
					<div className="group-hover:flex hidden absolute bottom-2 left-2 transition duration-300">
						<button className="flex flex-row items-center gap-1 bg-zinc-800/50 text-zinc-500 hover:bg-purple-600 hover:text-white px-2 p-1 font-inter"
							onClick={onClear}
						>
							clear
						</button>
					</div>
				</div>
				{side && (
					<div
						onMouseDown={(e) => handleMouseDown(e, containerRef, setOutputWidth)}
						className="w-1 h-full shrink-0 cursor-col-resize"
					/>
				)}
				<div 
					style={{
						width: side ? `${outputWidth}px` : "100%",
					}}
					className={`${option == "output" || side ? "flex" : "hidden"} flex flex-col w-full h-full`}
				>
					<RawOutput output={output} setOutput={setOutput} activeFile={activeFile} currentDevice={currentDevice}/>
				</div>
			</div>
		</section>
	);
}

const RawOutput = function({output, setOutput, activeFile, currentDevice}){
	const [raw, setRaw] = useState(false);
	const {ref: outputRef, handleScroll} = useAutoScroll(output);
	const [message, setMessage] = useState(null);
	const [execute, setExecute] = useState(false);
	useEffect(() => {
		setExecute(activeFile?.origin === "device");
	}, [activeFile])

	const stop = () => {
		setMessage("stoping ...");
		try{
			const data = {
				type: "terminal_input",
				data: "stop",
				device_id: currentDevice
			}
			sendToBackend(data);
		} catch (err) {
			console.log(err);
			setMessage("stop failed");
			return;
		} setMessage("stopped");
	}

	const run = () => {
		if(!execute) return;
		if (!activeFile?.path) {
			setMessage("no file selected");
			return;
		}
		setMessage("running ...");
		try{
			const path = activeFile.path;
			const data = {
				type: "terminal_input",
				data: `boot ${path}`,
				device_id: currentDevice
			}
			sendToBackend(data);
		} catch (err) {
			console.log(err);
			setMessage("run failed");
			return;
		} setMessage("runned");
	}
	return(
		<div className="w-full h-full flex flex-col border border-zinc-800 rounded-md overflow-hidden">
			{(activeFile || message) &&
			<div className="w-full h-fit p-1 border-b border-zinc-800/60 text-xs font-inter flex flex-row gap-1 text-white overflow-auto dark-scrollbar">
				{activeFile?.path &&
				<div className="p-1 bg-zinc-500/20 px-2 text-zinc-400 flex items-center hover:text-zinc-200">
					<span>{activeFile?.path}</span>
				</div>
				}
				{message &&
				<div className="px-2 p-1 flex items-center bg-zinc-500/20 text-zinc-400">
					<span className="line-clamp-1">{message}</span>
				</div>
				}
			</div>
			}
			{output?.length > 0 ? (
				<div ref={outputRef} onScroll={handleScroll} className="h-full overflow-auto dark-scrollbar p-2 pb-8 flex flex-col gap-1">
					{output.map((item, index) => (
						<div key={index} className="mb-3">
							{raw ? (
								<pre className="text-xs text-zinc-300">
									{JSON.stringify(item, null, 2)}
								</pre>
							) : (
								<div className="text-xs font-mono">
									{Object.entries(item.data || item).map(
										([key, value]) => (
											<div key={key} className="flex gap-1">
												<span className="text-purple-400">
													{key}:
												</span>
												<span className="text-zinc-300">
													{typeof value === "object"
														? String(value)
														: typeof value === 'object'
														? JSON.stringify(value)
														: String(value)}
												</span>
											</div>
										)
									)}
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="h-full bg-zinc-800/10 font-inter flex items-center justify-center">
					<div className="text-zinc-500 text-sm">
						No Output
					</div>
				</div>
			)}
			<div className="w-full h-fit bg-black p-1 border-t border-zinc-800/60">
				<div className="text-xs font-inter flex flex-row gap-1 text-white overflow-auto dark-scrollbar">
					<button className="px-2 p-0.5 bg-zinc-500/20 disabled:cursor-not-allowed hover:bg-purple-600/60"
						onClick={() => run()}
						disabled={!execute}
					>
						<VscRunCompact/>
					</button>
					<button className="px-2 p-0.5 bg-zinc-500/20 disabled:cursor-not-allowed hover:bg-red-600/60"
						onClick={() => stop()}
					>
						stop
					</button>
					
					<button className="ml-auto text-white bg-zinc-500/20 px-2 p-0.5 hover:bg-purple-600/60 cursor-pointer"
						onClick={() => setOutput([])}
					>
						clear
					</button>
					<button className={`px-2 py-0.5 text-xs font-inter transition-colors
							${raw
								? "bg-orange-600/50 text-white"
								: "bg-purple-600/50 text-white"
							}
						`}
						onClick={() => setRaw((prev) => !prev)}
					>
						{raw ? "json" : "text"}
					</button>
				</div>
			</div>
		</div>
	)
}


const useAutoScroll = (dependency) => {
	const ref = useRef(null);
	const [autoScroll, setAutoScroll] = useState(true);

	const handleScroll = () => {
		if (!ref.current) return;

		const distance =
			ref.current.scrollHeight -
			ref.current.scrollTop -
			ref.current.clientHeight;

		setAutoScroll(distance < 20);
	};

	useEffect(() => {
		if (!ref.current || !autoScroll) return;

		ref.current.scrollTop = ref.current.scrollHeight;
	}, [dependency, autoScroll]);

	return {
		ref,
		handleScroll,
	};
};