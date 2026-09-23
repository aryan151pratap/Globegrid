import React, { useEffect, useState } from "react";
import ViewCode from "./viewCode";
import { VscCheckAll, VscCode, VscLockSmall, VscVscode } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { useNotify } from "../Device-IDE/notify";
import { all_projects_files, get_project, list_projects } from "../../hooks/projectHandle";
import ViewReactProject from "../project_ui/reactCode";
import ProjectList from "./projectList";

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
                <ProjectList data={data} loading={loading}/>
            </div>
        </div>
    );
};

export default Inventory;