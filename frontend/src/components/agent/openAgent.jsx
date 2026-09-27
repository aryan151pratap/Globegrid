import { useState, useRef } from "react";

export function OpenAgent({ openAgent, setOpenAgent }) {
	return (
		<div className={`w-fit h-fit ${openAgent ? "opacity-80" : "opacity-60"} hover:opacity-100 z-50 select-none`}>
		<div
			className="group/agent w-fit h-fit p-1 shadow-md shadow-black bg-white rounded font-inter cursor-pointer"
			onClick={() => setOpenAgent((e) => !e)}
		>
			<div className="shrink-0 flex text-xs px-2 font-semibold">
			{openAgent ? (
				<span className="line-clamp-1">Globegrid Agent</span>
			) : (
				<div className="flex flex-row items-center overflow-hidden">
					<div className="max-w-0 group-hover/agent:max-w-[100px] opacity-0 group-hover/agent:opacity-100 overflow-hidden transition-all duration-300 px-0 group-hover/agent:px-1 whitespace-nowrap">
						Globegrid
					</div>
					<span>AI</span>
					<div className="max-w-0 group-hover/agent:max-w-[100px] opacity-0 group-hover/agent:opacity-100 overflow-hidden transition-all duration-300 px-0 group-hover/agent:px-1 whitespace-nowrap">
						Agent
					</div>
				</div>
			)}
			</div>
		</div>
		</div>
	);
}