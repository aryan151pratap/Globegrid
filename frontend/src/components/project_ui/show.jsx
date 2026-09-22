import { useEffect, useState } from "react";
import ViewReactProject from "./reactCode";
import { useParams } from "react-router-dom";
import { get_project } from "../../hooks/projectHandle";
import {
    VscRefresh,
    VscCircleFilled,
    VscChip,
} from "react-icons/vsc";

const Show = () => {
    const [project, setProject] = useState(null);
    const [backendConnection, setBackendConnection] = useState(null);

    const { project_id } = useParams();
    const projectId = Number(project_id);

    useEffect(() => {
        get_project_files();
    }, []);

    const get_project_files = async function () {
        try {
            const res = await get_project(projectId);
            console.log(res);

            if (!res) return;

            setProject(res);
        } catch (err) {
            console.log(err);
        }
    };

    if (!project) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-gray-400">
                Loading project...
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-black">
            <header className="h-10 shrink-0 flex items-center gap-3 px-3 bg-zinc-900/95 border-b border-zinc-800">
                <button
                    onClick={get_project_files}
                    className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    title="Refresh project"
                >
                    <VscRefresh size={13} />
                    <span>Refresh</span>
                </button>

                <div className="h-5 w-px bg-zinc-800" />
                <div className="min-w-0 flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                        Project
                    </span>
                    <span className="capitalize max-w-40 truncate text-xs font-medium text-zinc-200">
                        {project?.name}
                    </span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-zinc-800/60 px-2 py-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Backend
                    </span>
                    <div className="flex items-center gap-1.5">
                        <VscCircleFilled size={8} className={backendConnection ? "text-emerald-500" : "text-red-500"}/>
                        <span className={`text-[11px] ${ backendConnection ? "text-emerald-400" : "text-red-400"}`}>
                            {backendConnection ? "Connected" : "Disconnected"}
                        </span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {project?.device_id ? (
                        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1">
                            <VscChip size={13} className="text-emerald-400"/>

                            <div className="flex flex-col leading-none">
                                <span className="text-[9px] uppercase tracking-wider text-zinc-600">
                                    Device
                                </span>

                                <span className="mt-0.5 max-w-48 truncate text-[11px] text-emerald-400">
                                    {project.device_id}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2.5 py-1 text-[11px] text-zinc-500">
                            <VscCircleFilled size={7} />
                            No device
                        </div>
                    )}
                </div>
            </header>

            <div className="min-h-0 flex-1">
                <ViewReactProject
                    files={project?.files}
                    device_id={project?.device_id}
                    setBackendConnection={setBackendConnection}
                />
            </div>
        </div>
    );
};

export default Show;