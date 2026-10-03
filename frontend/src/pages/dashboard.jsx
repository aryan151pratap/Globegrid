import { useEffect, useRef, useState } from "react";
import Editor from "./editor.jsx";
import Agent from "../components/agent/agent.jsx";
import { handleMouseDown } from "../services/silde.js";
import { useAuth } from "../AuthContext.jsx";
import { userData } from "../services/user.js";

const Dashboard = () => {
    const [agentWidth, setAgentWidth] = useState(300);
    const [userdata, setUserdata] = useState(null);
    const [openAgent, setOpenAgent] = useState(false);
    const [expand, setExpand] = useState(false);

    const containerRef = useRef(null);
    const data = useAuth();

    useEffect(() => {
        if (!data?.user?.user_id) return;
        const getData = async () => {
            try {
                const user = await userData(data.user.user_id);

                if (user) {
                    setUserdata(user);
                }
            } catch (err) {
                console.error(err);
            }
        };
        getData();
    }, [data?.user?.user_id]);

    return (
        <div
            ref={containerRef}
            className={`${expand && "fixed inset-0 z-[100]"} flex flex-row h-full min-h-0 min-w-0 w-full overflow-hidden`}
        >
            <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
                <Editor user={userdata} openAgent={openAgent} setOpenAgent={setOpenAgent} setExpand={setExpand}/>
            </div>

            <div
                className={`${openAgent ? "flex" : "hidden"} group h-full w-2 p-0.5 flex justify-center cursor-col-resize border-l border-zinc-900 bg-[#0d0d0f]`}
                onMouseDown={(e) =>
                    handleMouseDown(
                        e,
                        containerRef,
                        setAgentWidth
                    )
                }
            >
                <div className="h-full w-0.5 rounded-md group-hover:bg-orange-500/70" />
            </div>

            <div
                className={`${openAgent ? "flex" : "hidden"} h-full flex flex-col rounded-md`}
                style={{ width: `${agentWidth}px` }}
            >
                <div className="h-full border-l border-zinc-900 overflow-hidden">
                    <Agent />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;