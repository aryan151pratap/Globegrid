import { VscAdd, VscAddCompact, VscChevronRight, VscClose, VscCloseCompact, VscEdit, VscEditCompact, VscFileSymlinkDirectory, VscNewFile, VscNewFolder, VscRefresh, VscTrash } from "react-icons/vsc";
import UIFileExplorer from "./fodler_files";
import { useEffect, useState } from "react";
import { delete_file, delete_project, get_project, get_template, list_projects, save_file, save_project, update_project } from "../../../hooks/projectHandle";
import { useNotify } from "../notify";
import { EditProject } from "./editProject";

const array_of_files = function(data){
	const fileArray = Object.entries(data.files).map(([path, content]) => ({
		name: path.split("/").pop() || path,
		path,
		type: content === null ? "folder" : "file",
		content
	}));
	return {...data, files: fileArray};
}

const filesObject = (files) => {
    return Object.fromEntries(
        files.map(file => [
            file.path,
            file.type === "folder" ? null : file.content
        ])
    );
};

const CodeExplorer = function({files, activeFile, onFileClick, activeProject, setActiveProject, devices}){
	const [trigger, setTrigger] = useState(0);
	const [projectList, setProjectList] = useState([]);
	const [activeFiles, setActiveFiles] = useState([]);

	const [activeFolder, setActiveFolder] = useState(null);

	const [openProject, setOpenProject] = useState(false);
	const [addProject, setAddProject] = useState(false);
	const [projectName, setProjectName] = useState("");

	const [inputType, setInputType] = useState(null);
	const [loading, setLoading] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const notify = useNotify();

	const fetchProjectList = async function(){
		try{
			setLoading({read_project_list: true});
			const list = await list_projects();
			if(list){
				setProjectList(list);
			} else {
				notify({type: "error", message: "projects not fetched"});
			}
		} catch (err) {
			notify({type: "error", message: `error ${err}`});
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchProjectList();
	}, [trigger])

	const handleRefresh = function(){
		if(!activeProject) return;
		console.log(activeProject);
		get_project_files(activeProject, true);
	}

	const handleSelectFiles = function(item){
		setActiveProject(item);
		setActiveFiles(item?.files ?? []);
		handleProjectDivClose();
	}

	const handleAddFile = function(){
		setInputType({type: "file", value: ""});
	}
 
	const handleAddFolder = function(){
		setInputType({type: "folder", value: ""});
	}
	const handleProjectDivClose = function(){
		setOpenProject(false);
		setAddProject(false);
	}

	const handleGetTemplate = async function(projectName){
		if(!projectName.trim()) return;
		const find = projectList.find((item) => item.name == projectName);
		if(find) {
			notify({type: "warning", message: "project name exists"});
			return;
		}
		try{
			setLoading({read_project_files: true});
			const res = await get_template(projectName);
			if(!res) {
				notify({type: "error", message: "not template found"});
				return;
			}
			notify({type: "status", message: res.message});
			const project = array_of_files(res.project);
			setProjectList((e) => ([...e, project]));
			handleSelectFiles(project);
		} catch (err) {
			notify({type: "error", message: err});
		} finally {
			setLoading(false);
		}
	}

	const handleSaveProject = async function(){
		if(!activeProject) return;
		console.log(activeProject);
		try{
			setLoading({read_project_list: true});
			if(!activeProject?.id) {
				notify({type: "warning", message: "project id not found"});
				return;
			}
			const data = {...activeProject, files: filesObject(activeProject?.files)}
			const res = await update_project(activeProject?.id, data);
			if(res) notify({type: "status", message: res.message});
		} catch (err) {
			notify({type: "error", message: err});
		} finally {
			setLoading(null);
		}
	} 

	const get_project_files = async function(project, force=false){
		if(project?.files && !force) {
			handleSelectFiles(project);
			return;
		}
		try{
			setLoading({read_project_files: true, read_project_list: true});
			if(!project?.id) {
				notify({type: "warning", message: "project id not found"});
				return;
			}
			const res = await get_project(project?.id);
			if(!res) {
				notify({type: "error", message: "project not found"});
				return;
			}
			notify({type: "status", message: "files loaded"});
			const project_data = array_of_files(res);
			handleSelectFiles(project_data);
		} catch (err) {
			notify({type: "error", message: err});
		} finally {
			setLoading(false);
		}
	}

	const del_project = async function(project){
		try{
			setLoading({read_project_files: true});
			if(!project?.id) {
				notify({type: "warning", message: "project id not found"});
				return;
			}
			const res = await delete_project(project?.id);
			if(!res) {
				notify({type: "error", message: "project not found"});
				return;
			}
			notify({type: "status", message: res.message});
			setProjectList((e) => e.filter((item) => item.id !== project.id));
			setActiveProject((e) => {
				if(e?.id === project.id){
					setActiveFiles([]);
					return null;
				}
				return e;
			});
		} catch (err) {
			notify({type: "error", message: err});
		} finally {
			setLoading(false);
		}
	}

	const save_file_folder = async () => {
		const name = inputType?.value?.trim().replace(/^\/+|\/+$/g, "");
		if (!name) return;
		if (!activeProject?.id) return notify({ type: "warning", message: "Project ID not found" });

		const path = `${activeFolder ?? ""}/${name}`;
		if (activeFiles.some((f) => f.path === path)) {
			return notify({ type: "warning", message: "Already exists" });
		}

		setLoading({ read_project_list: true });
		try {
			const res = await save_file(activeProject.id, {
				path,
				content: inputType.type === "folder" ? null : "",
			});
			if (!res) return notify({ type: "error", message: "Project not found" });

			const files = array_of_files({ files: res.files }).files;
			setActiveFiles(files);
			setActiveProject((p) => ({ ...p, files }));
			notify({ type: "status", message: res.message });
		} catch (err) {
			notify({ type: "error", message: err?.message || "Failed to save" });
		} finally {
			setLoading(false);
		}
	};

	const delete_file_folder = async function(node){
		if (!activeProject?.id) return notify({ type: "warning", message: "Project ID not found" });
		try{
			setLoading({ read_project_list: true });
			const project_id = activeProject?.id;
			const res = await delete_file(project_id, node?.path);
			if (!res) return notify({ type: "error", message: `${node?.type} not deleted`});
			onFileClick(null);
			const files = activeFiles.filter((item) => item.path !== node?.path);
			setActiveFiles(files);
			notify({ type: "status", message: res.message });
		} catch (err) {
			notify({ type: "error", message: err?.message || "Failed to save" });
		} finally {
			setLoading(false);
		}
	}

	return(
		<div className="group w-full h-full flex flex-col overflow-auto">
			{loading?.read_project_list &&
				<CodeLoading/>
			}
			{openEdit &&
			<div>
				<EditProject project={activeProject} 
					setOpenEdit={setOpenEdit} 
					projectList={projectList} 
					setTrigger={setTrigger} 
					devices={devices} 
					handleGetTemplate={handleGetTemplate} 
					del_project={del_project}
					get_project_files={get_project_files}
				/>
			</div>
			}
			<div className="bg-[#CEF144]/90 flex flex-row items-center justify-between text-black">
				<div className="text-black px-2 p-1 text-xs">
					<span className="line-clamp-1 capitalize" title={activeProject ? activeProject?.name : "Project"}>{activeProject ? activeProject?.name : "Project"}</span>
				</div>
				<div className="flex flex-row px-2 gap-2 text-black/80">
					<button
						title="Edit Project"
						className="rounded hover:text-zinc-700 cursor-pointer"
						onClick={() => setOpenEdit(e => !e)}
					>
						<VscEdit/>
					</button>
					<button
						title="New File"
						className="rounded hover:text-zinc-700 cursor-pointer"
						onClick={handleAddFile}
					>
						<VscNewFile/>
					</button>
					<button
						title="New Folder"
						className="rounded hover:text-zinc-700 cursor-pointer"
						onClick={handleAddFolder}
					>
						<VscNewFolder/>
					</button>
					<button className="hover:text-zinc-700 cursor-pointer"
						title="new project"
						onClick={() => setOpenProject((e) => !e)}
					>
						<VscFileSymlinkDirectory/>
					</button>
				</div>
			</div>
			<div className="w-full">
				{activeProject && activeFolder && (
					<div className="w-full bg-zinc-500/10 border-b border-zinc-800 px-2 p-1 flex flex-row items-center text-xs text-zinc-400 overflow-auto hide-scrollbar shrink-0">
						{activeFolder?.split("/").filter(Boolean).map((i, index, arr) => (
							<div key={index} className="flex flex-row items-center">
								<span className="">{i}</span>
								<span className="text-green-500 p-0.5">
									<VscChevronRight />
								</span>
							</div>
						))}
						<div>{activeFile?.path?.includes(activeFolder) && activeFile?.name}</div>
					</div>
				)}
				
				{inputType &&
				<div className="flex flex-row items-center border border-[#CEF144]/50 hover:border-[#CEF144] focus-within:border-[#CEF144]">
					<input type="text" 
						placeholder={`Enter ${inputType?.type}`}
						value={inputType?.value}
						onChange={(e) => setInputType((item) => ({...item, value: e.target.value}))}
						className="w-full px-2 p-1 text-xs bg-zinc-900 focus:bg-black outline-none"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								save_file_folder();
							}
						}}
					/>
					<span className="px-1 text-zinc-400 hover:text-red-500 cursor-pointer"
						onClick={() => setInputType(null)}
					>
						<VscCloseCompact/>
					</span>
				</div>
				}
			</div>
			{openProject &&
			<div className="absolute z-50 top-8 w-full p-2">
				<div className="relative bg-black backdrop-blur-md border border-zinc-800 hover:border-zinc-700">
					{loading?.read_project_files &&
						<CodeLoading/>
					}
					<div className="text-xs px-2 p-1 flex items-center justify-between">
						<span className="capitalize text-[#CEF144]" title="Select Project">select project</span>
						<span className="text-zinc-500 hover:text-red-500 cursor-pointer" title="close"
							onClick={() => handleProjectDivClose()}
						>
							<VscCloseCompact size={14}/>
						</span>
					</div>
					
					<div className="max-h-[140px] bg-zinc-900/20 h-fit min-h-0 overflow-auto dark-scrollbar">
						{projectList?.map((i, index) => (
							<div key={i?.id ?? index} className="bg-zinc-600/10 text-zinc-400 hover:bg-zinc-500/20 hover:text-white hover:border-zinc-500/50 hover:border-t hover:border-b border-b border-t border-zinc-900/0 border-t-zinc-800/50 cursor-pointer"
								onClick={() => get_project_files(i)}
							>
								<div className="text-xs flex flex-row items-center gap-2 font-inter px-2 p-1">
									<span className="text-zinc-300">{index+1}.</span>
									<span title={i?.name} className="capitalize line-clamp-1">{i?.name}</span>
									<button className="ml-auto hover:text-red-500"
										onClick={() => del_project(i)}
									>
										<VscTrash size={14}/>
									</button>
								</div>
							</div>
						))}
					</div>
					{addProject &&
					<div className="w-full flex flex-row items-center border border-b-zinc-300/0 border-zinc-800/50 hover:border-b-[#CEF144] focus-within:border-b-[#CEF144] text-[#CEF144]">
						<input type="text" value={projectName} 
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleGetTemplate(projectName);
								}
							}}
							onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name...." className="hover:bg-zinc-500/20 placeholder:text-[#CEF144]/60 focus:bg-zinc-500/20 text-xs w-full bg-black outline-none px-2 p-1"
						/>
							
						<span className="p-1 cursor-pointer"
							onClick={() => setAddProject(false)}
						>
							<VscCloseCompact/>
						</span>
					</div>
					}
					<div className="bg-[#CEF144] px-2 p-1 flex text-xs text-black">
						<button className="flex flex-row items-center gap-1"
							onClick={() => setAddProject(true)}
						>
							<VscAddCompact/>
							<span>Add</span>
						</button>
					</div>
				</div>
			</div>
			}
			<div className="w-full h-full flex flex-col overflow-auto">
				<UIFileExplorer
					files={activeFiles}
					activeFile={activeFile}
					onFileClick={onFileClick}
					activeFolder={activeFolder}
					setActiveFolder={setActiveFolder}
					delete_file_folder={delete_file_folder}
				/>
			</div>
			<div className="hidden group-hover:flex w-full justify-between absolute inset-0 top-auto p-1 rounded">
				<div
					className="px-2 p-1 text-xs backdrop-blur-sm flex flex-row items-center gap-2 bg-zinc-800/60 hover:bg-[#CEF144] hover:text-black cursor-pointer text-zinc-400 capitalize border border-zinc-900"
					onClick={() => handleRefresh()}
				>
					<VscRefresh />
					<span>refresh</span>
				</div>

				<div
					className="px-2 p-1 text-xs backdrop-blur-sm flex flex-row items-center gap-2 bg-zinc-800/60 hover:bg-[#CEF144] hover:text-black cursor-pointer text-zinc-400 capitalize border border-zinc-900"
					onClick={() => handleSaveProject()}
				>
					<VscAddCompact />
					<span>save project</span>
				</div>
			</div>
		</div>
	)
}

export default CodeExplorer;

const CodeLoading = function(){
	return(
		<div className="absolute z-50 bg-zinc-500/20 h-full w-full flex items-center justify-center">
			<div className="border-2 border-[#CEF144] p-2 rounded-full border-t-transparent animate-spin"></div>
		</div>
	)
}