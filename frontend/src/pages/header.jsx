import { CiMenuBurger, CiMicrochip } from "react-icons/ci";
import { Link } from "react-router-dom";
import { logout } from "../services/authService";

const Header = function({setShowSideBar, user}){

	const handleLogout = async function(){
		try{
			const res = await logout();
			if(res.message) window.location.reload();
		} catch (err) {
			console.log(err);
		}
	}

	return(
		<div className="w-full bg-black flex border-b border-zinc-800">

			<button
				onClick={() => setShowSideBar(e => !e)}
				className="h-full p-3 text-zinc-500 border-r border-zinc-800 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
				title="Open Explorer"
			>
				<CiMenuBurger size={17} />
			</button>
			<div className="px-4 w-full flex flex-row items-center justify-between">
				<div className="flex h-10 items-center ">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-400 font-bold text-black">
						<CiMicrochip className="h-5 w-5"/>
					</div>

					<span className="ml-3 font-semibold text-white">
						Globegrid
					</span>
				</div>
				<div className="text-white text-lg font-bold">IoT Dashboard</div>
				<div className="text-sm flex items-center gap-2">
					<Link to={"/profile"} className="text-white bg-zinc-500/40 text-zinc-300 hover:bg-purple-500/80 hover:text-white px-2 p-1">Profile</Link>
					<button className="text-white bg-zinc-500/40 text-zinc-300 px-2 p-1 hover:bg-white hover:text-black"
						onClick={() => handleLogout()}
					>
						Logout
					</button>
				</div>
			</div>
			<div className=""></div>
		</div>
	)
}

export default Header;