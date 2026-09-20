import { useCallback, useEffect, useRef, useState } from "react";
import { connectAgent, disconnectAgent } from "../services/deviceService";
import { useNotify } from "../components/Device-IDE/notify";
import { agent_model_list } from "./agentHandle";
import { addFileChange } from "../services/fileChangeStore";
const BASE_RETRY_MS = 1000;
const MAX_RETRY_MS = 15000;

export const useAgent = () => {
    const [messages, setMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("connecting"); // "connecting" | "connected" | "reconnecting" | "disconnected"
    const [models, setModels] = useState();
    const [details, setDetails] = useState(null);
    const isMountedRef = useRef(true);
    const manualDisconnectRef = useRef(false);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef(null);

    const get_model_list = async function(){
        try{
            const llm_list = await agent_model_list();
            setModels(llm_list);
        } catch (err) {
            console.log(err);
        }
    }
    
    useEffect(() => {
        get_model_list();
    }, [])

    const thinkingEnd = function(){
        try{
            setMessages((prev) => {
                let last = prev[prev.length - 1];
                if (last?.type === "thinking") {
                    return [...prev.slice(0, -1), { ...last, streaming: false }];
                } else {
                    const last = prev[prev.length - 2];
                    if(last?.type === "thinking") {
                        return [...prev.slice(0, -2), { ...last, streaming: false }, prev[prev.length - 1]];
                    }
                }
                return prev;
            });
        } catch (err) {
            console.log(err);
        }
    }

    const handleAgentMessage = useCallback((data) => {
        console.log("Agent response:", data);
        const type = data.type;
        if (data.type === "file_changed") {
            addFileChange({
                id: Date.now(),
                path: data.path,
                operation: data.operation,
                version: data.version,
            });

            return;
        }
        if(type === "model_changed"){
            setDetails((e) => ({...e, provider: data.provider, model: data.model}));
            return;
        }
        if(data.type === "details"){
            setDetails(data);
            return;
        }
        if (data.type === "model_list") {
            setModels(data);
            return;
        }
        if (data.type == "error") {
            console.log("agent error", data);
            setMessages((prev) => [...prev, {id: Date.now(), role: "assistant", type: "error", content: data?.content, streaming: false, retry_time: data?.retry_after}]);
            thinkingEnd();
            return;
        }

        if (data.type === "thinking_start") {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    role: "assistant",
                    type: "thinking",
                    content: "",
                    streaming: true,
                },
            ]);
            return;
        }
        if (data.type === "thinking_end") {
            thinkingEnd();
            return;
        }

        if (data.type === "tool_start" || data.type === "tool_end") {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    role: "assistant",
                    type: data.type,
                    tool: data.tool,
                    content: data.content,
                    streaming: false,
                },
            ]);
            return;
        }

        setMessages((prev) => {
            const last = prev[prev.length - 1];
            const canAppend =
                last?.role === "assistant" && last.streaming && last.type === "chunk";

            if (canAppend) {
                return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + (data?.content || "") },
                ];
            }

            return [
                ...prev,
                {
                    id: Date.now(),
                    role: "assistant",
                    type: data.type,
                    content: data?.content || "",
                    streaming: true,
                },
            ];
        });
    }, []);

    const clearReconnectTimer = () => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    };

    const scheduleReconnect = useCallback(() => {
        if (!isMountedRef.current || manualDisconnectRef.current) return;

        clearReconnectTimer();

        const attempt = reconnectAttemptsRef.current;
        const delay = Math.min(BASE_RETRY_MS * 2 ** attempt, MAX_RETRY_MS);
        reconnectAttemptsRef.current = attempt + 1;

        setConnectionStatus("reconnecting");

        reconnectTimerRef.current = setTimeout(() => {
            if (!isMountedRef.current || manualDisconnectRef.current) return;
            connectAgent(handleAgentMessage, handleConnection);
        }, delay);
    }, [handleAgentMessage]);

    const handleConnection = useCallback(
        (status) => {
            console.log("Agent connection:", status);

            if (status) {
                reconnectAttemptsRef.current = 0;
                clearReconnectTimer();
                setConnectionStatus("connected");
            } else {
                if (manualDisconnectRef.current) {
                    setConnectionStatus("disconnected");
                } else {
                    scheduleReconnect();
                }
            }
        },
        [scheduleReconnect]
    );

    useEffect(() => {
        isMountedRef.current = true;
        manualDisconnectRef.current = false;
        reconnectAttemptsRef.current = 0;

        setConnectionStatus("connecting");
        connectAgent(handleAgentMessage, handleConnection);

        return () => {
            isMountedRef.current = false;
            manualDisconnectRef.current = true;
            clearReconnectTimer();
            disconnectAgent();
        };
    }, []);

    return {
        messages,
        setMessages,
        connected: connectionStatus === "connected",
        connectionStatus,
        models,
        details,
    };
};