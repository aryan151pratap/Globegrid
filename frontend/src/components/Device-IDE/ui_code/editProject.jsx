import { useEffect, useState } from "react";
import { VscAddCompact, VscArrowRight, VscCloseCompact, VscDebugConnected, VscProject, VscSearch, VscTrash } from "react-icons/vsc";
import { VscEdit, VscCheck, VscClose } from "react-icons/vsc";
import { update_project_details } from "../../../hooks/projectHandle";
import { useNotify } from "../notify";

export function EditProject({project, setOpenEdit, projectList, setTrigger, devices}) {
	const [addProject, setAddProject] = useState(false);
	const [currentProject, setCurrentProject] = useState(null);
	useEffect(() => {
		setTrigger((e) => e+1);
	}, [])

	useEffect(() => {
		console.log(currentProject);
	}, [currentProject])

	
	
	return(
		<div className="fixed z-[9999] inset-0 w-full h-full bg-zinc-500/10 backdrop-blur-sm flex flex-col items-center justify-center">
			<div className="max-w-xl shadow-2xl shadow-black max-auto min-h-60 flex flex-col rounded-md overflow-hidden bg-black border border-zinc-800 w-full text-sm font-inter">
				<div className="bg-[#CEF144]/90 text-black px-1 flex flex-ow items-center">
					<div className="capitalize p-1 text-zinc-800 flex flex-row gap-2 items-center">
						<VscProject className="text-black"/>
						<span className="">Project List</span>
					</div>
					<button className="group/close ml-auto hover:bg-zinc-500/40 p-1 rounded-md"
						onClick={() => setOpenEdit(false)}
					>
						<VscCloseCompact className="text-zinc-600 group-hover/close:text-black" />
					</button>
				</div>
				<div className="flex flex-row h-full">
					<div className="w-full shrink-0 max-w-[200px] h-full flex flex-col border-r border-zinc-800">
						<div className="text-xs px-2 p-1 flex items-center justify-between border-b border-zinc-800/50">
							<span className="capitalize text-[#CEF144]" title="Select Project">select project</span>
						</div>
						
						<div className="h-full bg-zinc-900/20 overflow-auto dark-scrollbar">
							{projectList?.map((i, index) => (
								<div key={i?.id ?? index} className={`${currentProject?.id == i?.id ? "bg-zinc-500/20" : "bg-zinc-600/10 hover:bg-zinc-500/20 hover:text-white hover:border-zinc-500/50"} text-zinc-400 border-b border-t border-t-zinc-900/0 border-zinc-800/50 cursor-pointer`}
									onClick={() => setCurrentProject(i)}
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
						<div className="mt-auto w-full flex flex-row items-center border border-b-zinc-300/0 border-zinc-800/50 hover:border-b-[#CEF144] focus-within:border-b-[#CEF144] text-[#CEF144]">
							<input type="text" value={projectName} 
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleGetTemplate();
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
						<div className="w-fit p-1 flex text-xs text-black">
							<button className="bg-[#CEF144] px-2 p-1 flex flex-row gap-1 items-center rounded-md"
								onClick={() => setAddProject(true)}
							>
								<VscAddCompact/>
								<span>Add</span>
							</button>
						</div>
					</div>
					{currentProject ?
						<div className="w-full h-full flex flex-col text-xs">
							<div className="w-full flex items-center capitalize border-b border-zinc-800 text-xs">
								<span className="px-2 p-1">{currentProject?.name}</span>
								<button className="ml-auto hover:bg-zinc-500/20 text-zinc-400 hover:text-white p-1"
									onClick={() => setCurrentProject(null)}
								>
									<VscCloseCompact size={14}/>
								</button>
							</div>
							<div className="w-full flex">
								<ProjectDetails currentProject={currentProject} setCurrentProject={setCurrentProject} setTrigger={setTrigger} devices={devices}/>
							</div>

							<div className="w-full mt-auto border-t border-zinc-800">
								<button className="flex flex-row items-center gap-1 border-r border-zinc-800 hover:bg-zinc-500/20 px-2 p-1 bg-zinc-500/10">
									open
									<VscArrowRight/>
								</button>
							</div>
						</div>
						:
						<div className="w-full h-full flex items-center justify-center">
							<span className="text-zinc-500 capitalize">select project</span>
						</div>
					}
				</div>
			</div>							
		</div>
	)
}


const ProjectDetails = function({ currentProject, setCurrentProject, setTrigger, devices }) {
    const [editing, setEditing] = useState(null);
    const [values, setValues] = useState({
        name: currentProject?.name ?? "",
        description: currentProject?.description ?? "",
        device_id: currentProject?.device_id ?? "",
        language: currentProject?.language ?? "",
    });
	const [loading, setLoading] = useState(false);
	const [openDevice, setOpenDevice] = useState(false);
	console.log(devices);
	const handleProjectDetails = async function(key){
		if(!currentProject?.id) return;
		try{
			setLoading(true);
			const res = await update_project_details(currentProject?.id, 
				{
                	[key]: values[key],
            	}
			);
			if(res?.message) {
				setEditing(null);
				setCurrentProject(res.project);
				setTrigger((e) => e+1);
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	}
    const details = [
        {
            key: "name",
            label: "Name",
            value: currentProject?.name,
        },
        {
            key: "description",
            label: "Description",
            value: currentProject?.description,
        },
        {
            key: "device_id",
            label: "Device ID",
            value: currentProject?.device_id,
        },
        {
            key: "language",
            label: "Language",
            value: currentProject?.language,
        },
        {
            key: "id",
            label: "Project ID",
            value: currentProject?.id,
            editable: false,
        },
        {
            key: "created_at",
            label: "Created",
            value: currentProject?.created_at,
            editable: false,
        },
        {
            key: "updated_at",
            label: "Updated",
            value: currentProject?.updated_at,
            editable: false,
        },
    ];

    const handleChange = (key, value) => {
        setValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const saveEdit = (key) => {
        handleProjectDetails(key);
    };

    return (
        <div className="relative w-full flex flex-col overflow-auto bg-zinc-900/60 text-xs">
			{loading &&
				<CodeLoading/>
			}
            {details.map((item) => {
                const isEditing = editing === item.key;
                return (
                    <div key={item.key}
                        className="group flex flex-row gap-2 items-center gap-2 border-b border-zinc-800/70 px-2 last:border-b-0 hover:bg-zinc-800/30"
                    >
                        <div className="w-20 shrink-0 p-1">
                            <span className="text-xs text-zinc-500">
                                {item.label}
                            </span>
                        </div>

                        <div className="w-full">
                            {isEditing ? (
                                <input autoFocus
                                    value={values[item.key] ?? ""}
                                    onChange={(e) => handleChange(item.key, e.target.value)}
                                    className="w-full border-l border-zinc-900/0 bg-zinc-950 px-2 p-1 
									text-zinc-200 outline-none focus:border-[#CEF144]/60 focus:[#CEF144]
                                    "
                                />
                            ) : (
                                <span className="w-fit line-clamp-1 text-zinc-200">
                                    {item.value || (
                                        <p className="text-zinc-600">
                                            not set
                                        </p>
                                    )}
                                </span>
                            )}
                        </div>

						<div>
							{item.key == "device_id" &&
							<button className="hover:bg-zinc-500/20 px-2 p-1"
								onClick={() => setOpenDevice(e => !e)}
							>
								<VscSearch size={14}/>
							</button>
							}
						</div>

						{item.key == "device_id" && openDevice &&
						<div className="absolute mt-10 flex shadow-xl shadow-black/50">
							<div className="bg-black border border-zinc-800">
								<div className="w-full flex items-center px-2 p-1 bg-[#CEF144] text-black capitalize">
									device
									<button className="ml-auto hover:text-red-500"
										onClick={() => setOpenDevice(false)}
									>
										<VscCloseCompact size={14}/>
									</button>
								</div>
								<div className="w-full flex flex-col">
									{devices?.map((i, index) => (
										<div key={index} title={i?.device_id} className="flex flex-row items-center gap-2 cursor-pointer bg-zinc-500/10 hover:bg-zinc-500/20"
											onClick={() => {
												handleChange(item.key, i?.device_id);
												setOpenDevice(false);
											}}
										>
											<span className="p-1 ml-1">{index+1}.</span>
											<span className="capitalize">{i?.name}</span>
											<span className="text-[11px] text-zinc-500 p-">({i?.device_id})</span>
											<button className={`${i?.status === "online" ? "text-green-500" : "text-red-500"} p-1 hover:bg-zinc-500/20`}>
												{i?.status === "online" ? "on" : "off"}
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
						}

                        {item.editable !== false && (
                            <div className="w-fit ml-auto flex shrink-0 items-center gap-1">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => saveEdit(item.key)}
                                            className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10"
                                            title="Save"
                                        >
                                            <VscCheck size={15} />
                                        </button>

                                        <button
                                            onClick={() => setEditing(null)}
                                            className="rounded p-1 text-zinc-500 hover:bg-zinc-500/40 hover:text-zinc-300"
                                            title="Cancel"
                                        >
                                            <VscClose size={15} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditing(item.key)}
                                        className="rounded p-1 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-500/40 hover:text-zinc-200"
                                        title={`Edit ${item.label}`}
                                    >
                                        <VscEdit size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const CodeLoading = function(){
	return(
		<div className="absolute z-50 bg-zinc-500/20 h-full w-full flex items-center justify-center">
			<div className="border-2 border-[#CEF144] p-2 rounded-full border-t-transparent animate-spin"></div>
		</div>
	)
}