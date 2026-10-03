import React, { useEffect, useState } from "react";
import EditorFile from "../Device-IDE/EditorFile";
import { useNavigate } from "react-router-dom";
import { VscCheckAll, VscCode } from "react-icons/vsc";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import ViewReactProject from "../project_ui/reactCode";
import {data} from "../project_ui/data";

export default function HtmlPreview({setCodePreview, code=null}) {
    const [output, setOutput] = useState(false);
    const [expand, setExpand] = useState(false);

	const [html, setHtml] = useState({
        id: "index.html",
        language: "html",
        content: ""
    });

    useEffect(() => {
        setOutput(false);
        setExpand(false);
        if(!code) return;
        if(code?.language == "js"){
            setHtml({...code, language: "js"});
        }
        else setHtml(code);
    }, [code]);


	const navigate = useNavigate();

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type !== "navigate") {
                return;
            }
            const route = event.data.route;
            navigate(`/codePreview/${route}`);
        };
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [navigate]);

    

    const handleCodeChange = (content) => {
        setHtml((prev) => ({
            ...prev,
            content
        }));
    };

    return (
        <div className={`${expand ? "fixed inset-0 bg-black top-0 w-full h-full z-50" : ""} h-full w-full min-h-0 flex flex-col gap-2 overflow-auto`}>

            <div className="h-full w-full min-h-0 flex flex-col border border-zinc-800 bg-zinc-800/50 overflow-hidden">
                <div className="shrink-0 flex w-full gap-1 border-b border-zinc-800 p-1 overflow-auto hide-scrollbar">
                    <button
                        className="border border-zinc-800 flex items-center text-xs bg-zinc-500/20 rounded hover:bg-zinc-500/20 font-semibold"
                        onClick={() => setOutput((prev) => !prev)}
                    >
                        <VscCheckAll className={`w-9 px-2 p-1 h-full rounded ${!output ? "bg-orange-400/20 text-orange-500" : "hover:bg-zinc-500/5 text-zinc-300"}`} />
                        <VscCode className={`w-9 px-2 p-1 h-full rounded ${output ? "bg-orange-400/20 text-orange-500" : "hover:bg-zinc-500/5 text-zinc-300"}`} />
                    </button>
                    <button
                        className="text-zinc-300 ml-auto px-3 p-2 rounded text-xs bg-zinc-800/80 hover:bg-zinc-500/50 font-semibold"
                        onClick={() => setExpand(e => !e)}
                    >
                        {!expand ? <FiMaximize2/> : <FiMinimize2/>}
                    </button>
                    <button className="px-2 bg-zinc-500/15 hover:bg-red-500/20 rounded text-zinc-300 hover:text-red-500 text-xs"
                        onClick={() => setCodePreview(false)}
                    >
                        close
                    </button>
                </div>

                <div className="w-full flex-1 min-h-0 overflow-hidden">
                    {output ? (
                        <div className="w-full h-full min-h-0 overflow-hidden">
                            <EditorFile
                                file={html}
                                onChange={handleCodeChange}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full min-h-0 overflow-hidden">
                            <Code html={html.content} />
                        </div>
                    )}

                </div>
            </div>


        </div>
    );
}

const Code = ({ html }) => {
    return (
        <div className="w-full h-full min-h-0 overflow-auto hide-scrollbar">
            <iframe
                title="HTML Preview"
                srcDoc={html}
                className="w-full h-full border-0"
                sandbox="camera allow-scripts allow-same-origin allow-forms allow-modals"
            />
        </div>
    );
};