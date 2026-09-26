import { useEffect, useState } from "react";

import ChatContainer from "./chat/chat";
import AgentHeader from "./header";
import AgentInput from "./input";

import { sendToAgent } from "../../services/deviceService";
import { useAgent } from "../../hooks/useAgent";
import HtmlPreview from "./htmlpreview";
import { useAuth } from "../../AuthContext";
import AgentBackground from "./Agentbackground";
import {
    AgentProvider,
    useAgentContext
} from "./agentContext";
import { agent_model_list } from "../../hooks/agentHandle";
import Settings from "./setting";

const AgentContent = () => {
    const [input, setInput] = useState("");
    const [device_connection, setDeviceConnection] = useState(false);
	const [fileDirection, setFileDirection] = useState(false);
    const [showModels, setShowModels] = useState(false);
    const [current_model, setCurrent_model] = useState("");
    const {codePreview, setCodePreview, showCodePreview, setShowCodePreview} = useAgentContext();
    const {messages, setMessages, connected, connectionStatus, models, details} = useAgent();

    const data = useAuth();


    const handleSend = (current_model) => {
        const content = input.trim();
        if (!content) return;
        const userMessage = {
            id: Date.now(),
            role: "user",
            content,
            time: "just now",
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        sendToAgent({
            type: "message",
            message: content,
            model: current_model
        });
    };

    const handleClear = () => {
        setMessages([]);
    };

    const onDeviceConnect = (deviceId) => {
        setDeviceConnection(deviceId || null);
    };

    useEffect(() => {
		setCurrent_model(models?.default);
	}, [models])

    const handleSelectModel = function(i){
		if(!connected) return;
		sendToAgent({
			type: "change_model",
			model: i
		})
		setCurrent_model(i);
		setShowModels(false);
	}

    return (
        <div
            className={`relative ${
                fileDirection ? "flex-col" : "flex-row"
            } font-inter w-full flex h-full border-zinc-800 bg-[#0d0d0f] text-zinc-200 overflow-auto dark-scrollbar`}
        >
            <AgentBackground />

            <div>
                <Settings
                    showSettings={showModels}
                    setShowSettings={setShowModels}
                    current_model={current_model}
                    models={models}
                    handleSelectModel={handleSelectModel}
                    details={details}
                />
            </div>

            <div className={`${showCodePreview ? "md:flex hidden" : "flex"} relative h-full w-full min-h-0 flex flex-col overflow-visible`}>
                <AgentHeader
                    onClear={handleClear}
                    codePreview={showCodePreview}
                    setCodePreview={setShowCodePreview}
                    showCodePreview={fileDirection}
                    setShowCodePreview={setFileDirection}
                    details={details}
                    setShowModels={setShowModels}
                    
                />

                <ChatContainer
                    messages={messages}
                    data={data}
                />

                <div className="shrink-0">
                    <AgentInput
                        value={input}
                        onChange={setInput}
                        onSend={handleSend}
                        connected={connected}
                        connectionStatus={connectionStatus}
                        current_model={current_model}
                    />
                </div>

                <div className="mb-3" />
            </div>

            {showCodePreview && (
                <div className="z-50 w-full h-full min-h-0 flex overflow-hidden">
                    <HtmlPreview setCodePreview={setShowCodePreview} code={codePreview}/>
                </div>
            )}
        </div>
    );
};

const Agent = () => {
    return (
        <AgentProvider>
            <AgentContent />
        </AgentProvider>
    );
};

export default Agent;