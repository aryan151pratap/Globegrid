import { VscChevronRight, VscGitPullRequestClosed, VscGraphLeft } from "react-icons/vsc";

const EmptyEditor = function({currentDevice, iotConn}){
	return(
		<div className="text-zinc-300 bg-zinc-900 h-full flex items-center justify-center md:p-4 sm:p-4 p-2">
			<div className="text-sm font-inter p-4 p-2">
				{currentDevice && iotConn?.status == "online" ?
				<div className="flex flex-col gap-2 capitalize">
					<div className="flex flex-wrap">
						<span className="flex flex-row gap-1">
							<span>device</span> 
							<span className="bg-zinc-800 px-1 p-0.5 text-xs border border-zinc-700/50 rounded">{currentDevice}</span>
						</span>
						<span className="px-1 text-green-500">connected...</span>
					</div>
					<div className="px-2 flex justify-center text-xs text-zinc-500/90">Select files to open</div>
				</div>
				:
				<div className="flex w-full gap-2 text-zinc-300/80 text-xs">
					<div className="border border-zinc-600 p-2 flex flex-row items-center gap-2">
						<div className="mb-auto p-2 bg-zinc-500/20">
							<VscGraphLeft className="h-5 w-5"/>
						</div>
						<div className="line-clamp-2">
							<div className="text-[13px]">
								No device connected
							</div>
							<div className="text-xs text-zinc-400">
								Connect or select a device from the device panel
							</div>
						</div>
					</div>
					<div className="border border-zinc-600 p-2 flex flex-row items-center gap-2">
						<div className="mb-auto bg-zinc-500/20 p-2">
							<VscGitPullRequestClosed className="h-5 w-5"/>
						</div>
						<div className="line-clamp-2">
							<div className="text-[13px]">
								No device connected
							</div>
							<div className="text-xs text-zinc-400">
								Connect a device to browse its files
							</div>
						</div>
					</div>
				</div>
				}
			</div>
		</div>
	)
}

export default EmptyEditor;