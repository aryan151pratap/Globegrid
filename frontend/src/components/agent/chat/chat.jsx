import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./chatStyle";
import { BsCopy } from "react-icons/bs";
import MessageUI from "./messageUI";
import { useNotify } from "../../Device-IDE/notify";

const handleCopy = async (code, notify) => {
	try {
		await navigator.clipboard.writeText(code);
		notify({type: "status", message: "Link copied!"});
	} catch (err) {
		notify({type: "error", message: err.message});
	}
};


const ChatContainer = ({ messages, data }) => {
	const {ref: chatRef, handleScroll} = useAutoScroll(messages);
	
	return (
		//ref={chatRef}
		<div ref={chatRef} onScroll={handleScroll} className="h-fit min-h-0 w-full min-w-0 flex-1 overflow-auto hide-scrollbar px-4 py-5">
			<div className="max-w-3xl mx-auto flex flex-col overflow-auto dark-scrollbar">
				{messages.length === 0 ? (
					<div className="flex flex-1 items-center justify-center py-20 text-center">
						<div>
							<h2 className="text-lg font-semibold text-zinc-300">
								How can I help?
							</h2>

							<p className="mt-2 text-sm text-zinc-500">
							</p>
						</div>
					</div>
				) : (
					messages.map((message) => (
						<ChatType
							key={message.id}
							message={message}
							data={data}
						/>
					))
				)}
			</div>
			<div className="h-[40px]"></div>
		</div>
	);
};

export default ChatContainer;

const ChatType = ({ message, data }) => {
	const isUser = message.role === "user";
	const notify = useNotify();
	return (
		<div
			className={`w-full flex ${
				isUser ? "justify-end" : "justify-start"
			}`}
		>
			<div className={`${isUser ? "max-w-[400px]" : "w-full"} flex flex-col`}>
				{isUser ?
					<div className="ml-auto text-xs text-zinc-200/80 capitalize mt-10 mb-1">
						<span className="p-1 px-2 rounded-md bg-blue-500/10">{data?.user?.email.split("@")[0]}</span>
					</div>
					:
					<div></div>
			    }
				<pre
					className={`font-inter break-words text-wrap overflow-auto dark-scrollbar ${
						isUser
							? "px-4 py-2.5 max-h-[450px] bg-purple-400/10 text-orange-100/80 text-sm rounded-xl"
							: "text-zinc-300 text-[15px] break-words text-wrap"
					}`}
			    >
					{!isUser ?
						<MessageUI message={message}/>
						:
						message.content
					}
			    </pre>
				<div className="flex flex-row">
					<span className={`${isUser ? "ml-auto mt-1 mb-10" : "hidden"} text-zinc-400 hover:text-zinc-300 cursor-pointer`}
						onClick={() => handleCopy(message?.content ,notify)} 
					>
						<BsCopy/>
					</span>
					<span className="text-xs px-2 font-inter first-letter:capitalize text-zinc-400">{message?.time}</span>
				</div>
			</div>
		</div>
	);
};

const useAutoScroll = (dependency) => {
	const ref = useRef(null);
	const [autoScroll, setAutoScroll] = useState(true);

	const handleScroll = () => {
		if (!ref.current) return;

		const distance =
			ref.current.scrollHeight -
			ref.current.scrollTop -
			ref.current.clientHeight;

		setAutoScroll(distance < 20);
	};

	useEffect(() => {
		if (!ref.current || !autoScroll) return;

		ref.current.scrollTop = ref.current.scrollHeight;
	}, [dependency, autoScroll]);

	return {
		ref,
		handleScroll,
	};
};
