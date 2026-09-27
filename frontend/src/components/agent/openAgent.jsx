export function OpenAgent({openAgent, setOpenAgent}){
	return(
		<div className={`w-fit h-fit fixed ${openAgent ? "opacity-80" : "animate-pulse"} hover:opacity-100 inset-0 top-auto z-50 p-2 cursor-pointer select-none`}>
			<div className="group w-fit h-fit p-1 shadow-md shadow-black bg-white rounded font-inter"
				onClick={() => setOpenAgent((e) => !e)}
			>
				<div className="text-xs px-2 font-semibold">
					{openAgent ? 
					<span className="">Globegrid Agent</span>
					:
					<div className="group flex flex-row items-center overflow-hidden">
						<span>AI</span>
						<div className="max-w-0 group-hover:max-w-[100px] opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 px-0 group-hover:px-1 whitespace-nowrap">
							Globegrid
						</div>
					</div>
					}
				</div>
			</div>
		</div>
	)
}