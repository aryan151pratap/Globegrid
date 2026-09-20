import React, { useEffect, useState } from "react";
import ViewCode from "./viewCode";
import { VscCheckAll, VscCode, VscLockSmall, VscVscode } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { useNotify } from "../Device-IDE/notify";
import { all_projects_files, get_project, list_projects } from "../../hooks/projectHandle";
import ViewReactProject from "../project_ui/reactCode";

const Inventory = () => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const notify = useNotify();
    useEffect(() => {
        get_project_lists();
    }, [])

    const get_project_lists = async function(){
        try{
            setLoading(true);
            const list = await all_projects_files();
            if(list){
                setData(list);
            } else {
                notify({type: "error", message: "projects not fetched"});
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 text-white h-full w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
                    <p className="text-sm text-gray-500 mt-1">Your saved projects</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors">
                    + New Project
                </button>
            </div>

            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Projects {data?.length ? `(${data.length})` : ""}
            </h2>

            <div className="flex-1 overflow-auto dark-scrollbar -mx-1 px-1">
                {data?.length ? (
                <div className="flex-1 font-inter overflow-auto dark-scrollbar -mx-1 px-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-min content-start">
                        {data?.map((item, index) => (
                        <div
                            key={item?.id ?? index}
                            className="group flex w-fit md:flex-col sm:flex-col flex-row rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 transition-colors"
                        >
                            <div className="relative overflow-hidden bg-zinc-950">
                                <div className="">
                                    {item?.language == "react" ?
                                        <div className="flex">
                                            <ViewReactProject files={item?.files}/>
                                        </div>
                                    :
                                        null
                                    }
                                </div>
                                <div className="absolute inset-0 group-hover:bg-zinc-500/10 w-full h-full"></div>
                                <Link to={`/project/${item?.id}`} target="_blank" className="absolute inset-0 top-auto bottom-2 left-2 w-fit h-fit backdrop-blur-sm bg-zinc-500/10 px-2 p-1 hover:text-zinc-200 hover:bg-zinc-500/20 rounded opacity-0 group-hover:opacity-100 text-xs text-gray-500 transition-opacity cursor-pointer">
                                    Open →
                                </Link>
                            </div>
                            <div className="w-full px-3 py-2 flex flex-col gap-1 bg-zinc-500/10 group-hover:bg-zinc-500/20 border-t border-zinc-800">
                                <div className="w-full flex flex-row gap-2 items-center justify-between">
                                    <span className="capitalize text-sm text-zinc-200 truncate">{item.name}</span>
                                    <span className={`ml-auto text-xs ${item?.connection === "active" ? "text-green-600" : "text-zinc-400"} rounded`}>
                                        {item?.connection ?
                                        <VscLockSmall className="h-5 w-5"/>
                                        :
                                        <VscVscode/>
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
                    <p className="text-sm">No projects yet</p>
                    <p className="text-xs mt-1">Click "New Project" to get started</p>
                </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;