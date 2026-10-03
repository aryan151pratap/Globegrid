import {
    CiCircleList,
    CiGrid41,
    CiDesktop,
    CiViewList,
    CiSettings,
    CiCamera,
    CiFaceFrown,
    CiImageOn,
    CiFaceSmile,
    CiBoxes
} from "react-icons/ci";
import { FaCode } from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";

const SideBar = ({ user }) => {
    const location = useLocation();

    const menuItems = [
        {
            icon: <CiCircleList />,
            name: "workspace",
            items: [
                {
                    name: "Dashboard",
                    path: "/dashboard",
                    icon: <CiGrid41 />
                },
                {
                    name: "Devices",
                    path: "/devices",
                    icon: <CiCircleList />
                },
                {
                    name: "Settings",
                    path: "/settings",
                    icon: <CiSettings />
                },
                {
                    name: "Code Priview",
                    path: "/codePreview",
                    icon: <CiViewList />
                },
                {
                    name: "Inventory",
                    path: "/inventory",
                    icon: <CiBoxes />
                }
            ]
        },
        {
            icon: <CiFaceSmile/>,
            name: "AI Assistant",
            items: [
                {
                    name: "Corex Agent",
                    path: "/agent",
                    icon: <CiImageOn/>
                }
            ]
        }
    ];
	
    return (
        <div className="h-full flex w-64 shrink-0 flex-col border-r border-zinc-800/50 bg-[#09090b]/80">
            <nav className="mt-2 h-full flex-1">
                {menuItems.map((section, index) => (
                    <div
                        key={index}
                        className="flex h-fit flex-col gap-2"
                    >
                        <div className="flex items-center gap-2 px-2 p-2 text-sm font-semibold uppercase text-zinc-500">
                            <span className="text-lg text-orange-500">
                                {/* {section.icon} */}
                            </span>
                            <span>
                                {section.name}
                            </span>
                        </div>

                        <div className="flex h-full flex-row px-2">
                            <div className="h-full bg-orange-300">
                            </div>
                            <div className="ml-4 w-full">
                                {section.items.map((item) => {
                                    const active =
                                        location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex w-full rounded-md items-center gap-3 px-2 py-1.5 text-sm transition-colors cursor-pointer
                                                ${
                                                    active
                                                        ? "border-l-2 border-orange-500/80 bg-zinc-800/80 text-white"
                                                        : "text-zinc-300/80 hover:bg-zinc-800/50"
                                                }`}
                                        >
                                            <span
                                                className={`text-lg ${
                                                    active
                                                        ? "text-orange-400"
                                                        : "text-zinc-400"
                                                }`}
                                            >
                                                {item.icon}
                                            </span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-zinc-800 p-3">
                {user ? (
                    <div className="flex items-center gap-3 px-1">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-mono font-semibold capitalize text-white">
                            {user.name?.charAt(0)}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                                {user.email}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-2 text-sm font-semibold text-zinc-300">
                        loading...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SideBar;