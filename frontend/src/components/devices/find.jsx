import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const Find = ({devices, addingId, setAddingId}) => {
	const { user } = useOutletContext();
	const [addedIds, setAddedIds] = useState(new Set());

	return (
		<div className="group w-full h-fit bg-[#09090b] flex flex-col md:p-4 sm:p-4 p-1 text-zinc-200">
			
			<h2 className="w-fit border-b-2 border-zinc-100/0 group-hover:border-orange-500/80 group-hover:text-zinc-400 transition-colors mb-4 font-semibold tracking-wide text-zinc-500">
				Available Devices
			</h2>
			{devices.length > 0 ?
				(<div className="w-full h-full flex overflow-auto scrollbar-thin">
					{devices.map((d) => {
						const added = addedIds.has(d.device_id);
						const label = added || d.user_id ? "Added" : addingId === d.device_id ? "Adding…" : "Add";
						return (
							<div key={d?.device_id} className="h-fit flex items-center justify-between rounded-md border border-zinc-800 hover:border-cyan-500/50 bg-zinc-900/60 p-3.5">
								<div className="min-w-0">
									<p className="truncate text-sm font-medium text-zinc-100">{d?.name || "Unknown device"}</p>
									<p className="truncate font-mono text-xs text-zinc-500">{d?.device_id}</p>
									{d?.user_id && 
										<span className="text-xs flex gap-1 text-orange-500/60">{user?.id == d?.user_id ? "already added" : "added to another user"} 
											<span className="bg-cyan-500/20 rounded text-cyan-500 font-mono px-2 ">ID-{d?.user_id}</span>
										</span>
									}
								</div>
								<button onClick={() => setAddingId(d.device_id)} 
									disabled={added || addingId === d.device_id}
									className={`ml-3 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${added ? "bg-green-500/10 text-green-400" : "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"}`}>
									{label}
								</button>
							</div>
						);
					})}
				</div>)
			:
			<div className="px-5 text-zinc-400/40 bg-zinc-800/20 p-7">
				No online devices
			</div>
			}
		</div>
	);
};

export default Find;