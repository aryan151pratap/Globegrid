export function PageLoading(){
	return(
		<div className="fixed inset-0 z-50 h-screen w-full flex items-center justify-center bg-black">
			<div className="text-zinc-200 font-semibold">
				<span>Loading...</span>
			</div>
		</div>
	)
}