import { use, useEffect, useRef, useState } from "react";
import EditorFile from "../components/Device-IDE/EditorFile";
import FileExplorer from "../components/Device-IDE/fileExplorer";
import TerminalFile from "../components/Device-IDE/Terminal";
import FileHeader from "../components/Device-IDE/fileHeader";
import { sendToBackend, connectDashboard, disconnectDashboard } from "../services/deviceService.js";
import { getconnection, getESP, getFolder } from "../services/iotService.js";
import { userData } from "../services/user.js";
import { useNotify } from "../components/Device-IDE/notify.jsx";
import WriteFile from "../components/Device-IDE/writefile.jsx";
import EmptyEditor from "../components/Device-IDE/emptyEditor.jsx";
import { handleMouseDownHeight } from "../services/silde.js";
import { initFileChangeTrigger } from "../services/fileChangeStore.js";
import { OpenAgent } from "../components/agent/openAgent.jsx";


const lang = { js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",py:"python",java:"java",c:"c",cpp:"cpp",cs:"csharp",go:"go",rs:"rust",php:"php",rb:"ruby",html:"html",css:"css",scss:"scss",json:"json",xml:"xml",yaml:"yaml",yml:"yaml",md:"markdown",txt:"plaintext",sql:"sql",sh:"shell",bash:"shell",ps1:"powershell",dockerfile:"dockerfile",ini:"ini" };
const Editor = function ({user, openAgent, setOpenAgent}) {

	// iot device ecxplorer
	const [files, setFiles] = useState([]);
	const [fileData, setFileData] = useState([]);

	// ui code explorer
	const [activeProject, setActiveProject] = useState(null);

	const [activeFile, setActiveFile] = useState(null);

	const [terminal, setTerminal] = useState([]);
	const [openExplorer, setOpenExplorer] = useState(true);
	const [openTerminal, setOpenTerminal] = useState(true);
	const [iotConn, setIotConn] = useState({});
	const [backend, setBackend] = useState(null);
	const [currentDevice, setCurrentDevice] = useState(null);
	const [trigger, setTrigger] = useState(0);
	const [fileTrigger, setFileTrigger] = useState(0);
	const [output, setOutput] = useState([]);


	const [loading, setLoading] = useState(false);

	const terminalRef = useRef(null);
	const [terminalHeight, setTerminalHeight] = useState(250);
	const notify = useNotify();

	const getIotFiles = async function(path="", operation="list_folder", type="filesystem"){
		try {
			setLoading(true);
			const data = {
				type,
				device_id: currentDevice,
				operation,
				path,
			};
			sendToBackend(data);
		} catch (err) {
			notify({type: "error", message: err.message});
		}
	};

	useEffect(() => {
		if(!currentDevice) return;
		setFileData([]);
		getIotFiles();
	}, [currentDevice, iotConn, backend, fileTrigger])

	useEffect(() => {
		initFileChangeTrigger(setFileTrigger);
	}, []);
	
	useEffect(() => {
		const fetchESP = async () => {
			try {
				if(!currentDevice) return;
				notify({type: "status", message: `${currentDevice} connecting....`});
				const data = await getconnection(currentDevice);
				if(data.status == "online"){
					notify({type: "status", message: `${data?.name} ${data?.status} connected`});
					setIotConn(data);
					localStorage.setItem("currentDevice", currentDevice);
				} else {
					notify(data);
				} 
			} catch (err) {
				notify({type: "error", message: err.message});
				setCurrentDevice(null);
			}
		};
		fetchESP();
	}, [currentDevice]);

	const connectToDashboard = () => {
		try{
			disconnectDashboard();
			setBackend(null);
			connectDashboard(
				(data) => {
					console.log("editor data ", data);
					const type = data.type;
					if(type == "terminal") setTerminal((prev) => [...prev, data]);
					else if(type == "IOT") {
						setIotConn(data);
						setTrigger(e => e+1);
					}
					else if(type == "filesystem"){
						setLoading(false);
						const operation = data.operation;
						if(operation == "list_folder") setFiles(data.data);
						else if (operation === "read_file") {
							setFileData((prev) => {
								const currentFile = prev[data.path] || { content: "", totalLines: 0, currentLine: 0, origin: "device"};
								const updatedFile = data.total_lines !== undefined
									? { ...currentFile, content: "", totalLines: data.total_lines, currentLine: 0 }
									: { ...currentFile, content: currentFile.content + data.data, currentLine: data.count + 1 }
								setActiveFile(updatedFile);
								return {...prev, [data.path]: updatedFile};
							});
						}
						else if(operation === "write_start") {
							notify({type: "status", message: data.data});
						}
						else if(operation == "write_file_end"){
							notify({type: "status", message: data.data});
						}
						else if(operation == "create"){
							setFileTrigger(e => e+1);
							notify({type: "status", message: data.data});
						}
					}
					else if(type == "error") notify({type: data.type, message: data.data});
					else {
						setOutput((e) => ([...e, data]));
					}
				},
				(connected) => {
					console.log("Terminal connection:", connected);
					setBackend(connected);
				}
			);
		} catch (err) {
			notify({
				type: "error",
				message: err.message
			});
		}
	}

	useEffect(() => {
		connectToDashboard();
		return () => {
			disconnectDashboard();
		};
	}, []);

	const handleReconnect = () => {
		disconnectDashboard();
		setBackend(null);

		connectToDashboard();
	};

	const handleTerminalInput = (data) => {
		const res = {type: "terminal_input", device_id: currentDevice, data};
		setTerminal((e) => [...e, res]); 
		sendToBackend(res);
	};

	const handleFileSelect = (file) => {
		try{
			const data = fileData[file.path];
			if(!data){
				getIotFiles(file.path, "read_file");
				notify({type: "status", message: `${file.name} fetching...`});
				const newData = {
					id: file.path,
					name: file.name,
					path: file.path,
					type: file.type,
					content: "",
					language: lang[file.name.split(".")[1]],
					origin: "device"
				}
				setFileData((e) => ({...e, [file.path]: newData}));
				setActiveFile(newData);
			}else{
				setActiveFile(data);
			}
		} catch (err) {
			notify({type: "error", message: err.message});
		}
	};

	const handleCodeFileSelect = (file) => {
		if(!file) setActiveFile(null);
		try{
			const newData = {
				id: file.path,
				projectId: activeProject?.id,
				name: file.name,
				path: file.path,
				type: file.type,
				content: file.content,
				language: lang[file.name.split(".")[1]],
				origin: "project"
			}
			setActiveFile(newData);
		} catch (err) {
			notify({type: "error", message: err.message});
		}
	}

	const handleEditorChange = (content) => {
		setActiveFile((prevFile) => ({...prevFile, content}));
	};

	const handleClearTerminal = () => {
		setTerminal([]);
	};

	const handleCloseTerminal = () => {
		setOpenTerminal(e => !e);
	};

	const LoadFolders = async function(path){
		try{
			const folder = await getFolder(currentDevice, path);
			if(folder.data.length == 0){
				notify({type: "status", message: `${folder.path} Empty`});
				return;
			}
			else return folder.data;
		} catch (err) {
			notify({type: 'error', message: err.message});
		}
	}

	return (
		<div className="flex h-full w-full min-h-0 overflow-hidden
			scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600"
		>
			<div className="h-full w-fit shrink-0 overflow-hidden">
				{openExplorer &&
					<FileExplorer
						files={files}
						setFiles={setFiles}
						activeFile={activeFile}
						onFileSelect={handleFileSelect}
						setOpenExplorer={setOpenExplorer}
						setCurrentDevice={setCurrentDevice}
						currentDevice={currentDevice}
						trigger={trigger}
						onLoadFolder={LoadFolders}
						setFileTrigger={setFileTrigger}
						deviceLoading={loading}

						handleCodeFileSelect={handleCodeFileSelect}
						activeProject={activeProject}
						setActiveProject={setActiveProject}
					/>
				}
			</div>

			<div ref={terminalRef} className="group flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
				<div className="w-full flex flex-col items-center">
					<FileHeader 
						files={files} openExplorer={openExplorer} setOpenExplorer={setOpenExplorer}
						setActiveFile={setActiveFile} activeFile={activeFile} setOpenTerminal={setOpenTerminal}
						handleReconnect={handleReconnect} activeProject={activeProject}
					/>
					<WriteFile activeFile={activeFile} currentDevice={currentDevice} setFileTrigger={setFileTrigger} activeProject={activeProject}/>
				</div>
				<div className="relative flex min-h-0 flex-1">
					<div className="absolute inset-0 top-auto left-auto z-50 p-1">
						<OpenAgent openAgent={openAgent} setOpenAgent={setOpenAgent}/>
					</div>
					{activeFile ?
					<div className="min-h-0 flex-1 overflow-hidden hover:border-zinc-500/50">
						<EditorFile
							file={activeFile}
							onChange={handleEditorChange}
							projectId={activeProject?.id}
						/>
					</div>
					:
					<div className="h-full w-full">
						<EmptyEditor currentDevice={currentDevice} iotConn={iotConn}/>
					</div>
					}
				</div>
				
				{openTerminal &&
				<div className="">
					<div onMouseDown={(e) => handleMouseDownHeight(e, terminalRef, setTerminalHeight)}
						className="group h-1 shrink-0 bg-zinc-800/50 double-click:bg-purple-500 cursor-row-resize flex items-center p-[1px]"
					>
						<div className="group-hover:bg-purple-500"></div>
					</div>
					<div 
						ref={terminalRef}
						style={{ height: `${terminalHeight}px` }}
						className="shrink-0 overflow-auto"
					>
						<TerminalFile
							terminal={terminal}
							setTerminal={setTerminal}
							onClear={handleClearTerminal}
							onClose={handleCloseTerminal}
							onSend={handleTerminalInput}
							iotConn={iotConn}
							backend={backend}
							output={output}
							setOutput={setOutput}
							activeFile={activeFile}
							currentDevice={currentDevice}
						/>
					</div>
				</div>
				}
				
			</div>
		</div>
	);
};

export default Editor;