import { useEffect, useState } from "react";

// Fixed, centered settings modal. Reuses the zinc/purple visual language
// from ModelSelector — dark surfaces, hairline borders, purple accents,
// small/xs type. Wire `showSettings` / `setShowSettings` up to whatever
// button currently opens your settings panel.
const Settings = ({
	showSettings,
	setShowSettings,
	current_model,
	models,
	handleSelectModel,
	details,
}) => {
	const [showModels, setShowModels] = useState(false);
	const [showDetails, setShowDetails] = useState(true);
	const [mounted, setMounted] = useState(false);

	// pop-in on open, lock page scroll while modal is up
	useEffect(() => {
		if (!showSettings) {
			setMounted(false);
			return;
		}
		const raf = requestAnimationFrame(() => setMounted(true));
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => e.key === "Escape" && setShowSettings(false);
		window.addEventListener("keydown", onKey);
		return () => {
			cancelAnimationFrame(raf);
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", onKey);
		};
	}, [showSettings, setShowSettings]);

	if (!showSettings) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
			{/* backdrop */}
			<div
				className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${
					mounted ? "opacity-100" : "opacity-0"
				}`}
				onClick={() => setShowSettings(false)}
			/>

			{/* modal */}
			<div
				className={`relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden transition-all duration-200 ease-out ${
					mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
				}`}
			>
				{/* header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-black/30">
					<div className="flex flex-col text-xs">
						<span className="text-zinc-300/80">settings</span>
						<span className="lowercase text-purple-300/60">{current_model}</span>
					</div>
					<button
						onClick={() => setShowSettings(false)}
						className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded p-1.5 transition"
						aria-label="Close settings"
					>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path
								d="M1 1L13 13M13 1L1 13"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</div>

				{/* body */}
				<div className="p-4 flex flex-col gap-4 max-h-[65vh] overflow-y-auto hide-scrollbar">
					{/* model picker */}
					<div className="flex flex-col gap-1.5">
						<span className="text-[11px] text-zinc-500">model</span>
						<div className="relative">
							<button
								onClick={() => setShowModels((s) => !s)}
								className="w-full flex items-center justify-between border border-zinc-800 hover:border-purple-500/30 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg px-2.5 py-2 transition group"
							>
								<span className="flex items-center gap-2 text-xs text-zinc-200 capitalize truncate">
									<span className="w-1.5 h-1.5 shrink-0 rounded-full bg-purple-400" />
									{current_model || "select a model"}
								</span>
								<svg
									width="10"
									height="10"
									viewBox="0 0 10 6"
									fill="none"
									className={`shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-transform ${
										showModels ? "rotate-180" : ""
									}`}
								>
									<path
										d="M1 1L5 5L9 1"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>

							{showModels && (
								<div className="absolute left-0 right-0 mt-1.5 border border-zinc-800 bg-zinc-950 rounded-lg shadow-xl overflow-hidden">
									<div className="max-h-[140px] overflow-y-auto hide-scrollbar flex flex-col p-1">
										{models?.models?.map((m, index) => (
											<button
												key={index}
												onClick={() => {
													handleSelectModel(m);
													setShowModels(false);
												}}
												className={`${
													current_model === m
														? "bg-purple-500/15 text-zinc-100"
														: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
												} flex items-center gap-2 px-2 py-1.5 rounded-md text-xs capitalize transition text-left`}
											>
												<span className="w-5 h-5 shrink-0 flex items-center justify-center rounded bg-purple-500/15 text-purple-300 text-[10px]">
													{index + 1}
												</span>
												<span className="truncate flex-1">{m}</span>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* connection details */}
					{details && (
						<div className="flex flex-col gap-1.5">
							<span className="text-[11px] text-zinc-500">connection</span>
							<div className="flex flex-col gap-2 border border-zinc-800 bg-zinc-800/20 rounded-lg p-2.5">
								<div className="flex items-center justify-between text-xs">
									<span className="text-zinc-500">provider</span>
									<span className="text-zinc-200 capitalize">{details?.provider}</span>
								</div>

								<div className="flex items-center justify-between text-xs">
									<span className="text-zinc-500">type</span>
									<button
										onClick={() => setShowDetails((s) => !s)}
										className={`${
											showDetails
												? "bg-purple-500/15 text-purple-200"
												: "bg-zinc-700/40 text-zinc-300"
										} capitalize px-2 py-0.5 rounded hover:bg-purple-500/20 transition`}
									>
										{details?.type}
									</button>
								</div>

								<div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/70">
									<span className="text-zinc-500">device</span>
									<span
										className={`${
											details?.current_device
												? "text-green-300 bg-green-500/10"
												: "text-red-300 bg-red-500/10"
										} px-2 py-0.5 rounded flex items-center gap-1.5`}
									>
										<span
											className={`w-1.5 h-1.5 rounded-full ${
												details?.current_device ? "bg-green-400" : "bg-red-400"
											}`}
										/>
										{details?.current_device ? "connected" : "disconnected"}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* footer */}
				<div className="px-4 py-2.5 border-t border-zinc-800/80 bg-black/20 flex justify-end">
					<button
						onClick={() => setShowSettings(false)}
						className="text-xs px-3 py-1.5 rounded-md bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 transition"
					>
						done
					</button>
				</div>
			</div>
		</div>
	);
};

export default Settings;