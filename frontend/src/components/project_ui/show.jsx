import { useEffect, useState } from "react";
import ViewReactProject from "./reactCode";
import { Link, useParams } from "react-router-dom";
import { get_project } from "../../hooks/projectHandle";
import {
    VscRefresh,
    VscCircleFilled,
    VscChip,
} from "react-icons/vsc";
import { getESP } from "../../services/iotService";
import { PageLoading } from "../../pageLoading";

const Show = () => {
    const [project, setProject] = useState(null);
    const [backendConnection, setBackendConnection] = useState(null);
    const [device, setDevice] = useState(null);
    const [trigger, setTrigger] = useState(0);
    const [loading, setLoading] = useState(false);

    const { project_id } = useParams();
    const projectId = Number(project_id);

    useEffect(() => {
        get_project_files();
    }, [trigger]);

    useEffect(() => {
        get_iot_device();
    }, [project, trigger])

    const get_iot_device = async function(){
        try{
            if(!project?.device_id) return;
            const res = await getESP(project?.device_id);
            setDevice(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const get_project_files = async function () {
        setLoading(true);
        try {
            const res = await get_project(projectId);
            console.log(res);

            if (!res) return;

            setProject(res);
        } catch (err) {
            console.log(err);
        }
    };

    if (!project && !loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-gray-400">
                <div className="flex flex-col items-center">
                    <span>No Project Found...</span>
                    <Link to="/dashboard">
                        <span className="text-zinc-200/50 hover:text-blue-500 hover:underline text-sm font-inter">click here to create</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-black">
            {loading &&
                <PageLoading/>
            }
            <header className="h-10 shrink-0 flex items-center gap-3 px-3 bg-zinc-900/95 border-b border-zinc-800">
                <button
                    onClick={() => setTrigger((e) => e+1)}
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

                <div className="flex items-center gap-2 rounded-md bg-zinc-800/60 px-2 py-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Device
                    </span>
                    <div className="flex items-center gap-1.5">
                        <VscCircleFilled size={8} className={device?.status == "online" ? "text-emerald-500" : "text-red-500"}/>
                        <span className={`text-[11px] ${device?.status == "online" ? "text-emerald-400" : "text-red-400"}`}>
                            {device?.status == "online" ? "Connected" : "Disconnected"}
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

            <div className="w-full h-full flex-1">
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