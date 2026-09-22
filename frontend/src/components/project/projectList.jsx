import { Link } from "react-router-dom";
import {
    VscLockSmall,
    VscVscode,
    VscChip,
    VscCalendar,
    VscArrowRight,
} from "react-icons/vsc";

export default function ProjectList({ data, loading }) {
    return (
        <div className="flex-1 min-h-0 overflow-auto dark-scrollbar px-1 py-1">
            {data?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.map((item, index) => {
                        const hasDevice = Boolean(item?.device_id);

                        return (
                            <div
                                key={item?.id ?? index}
                                className="
                                    group relative flex flex-col overflow-hidden
                                    rounded-2xl border border-zinc-800/80
                                    bg-zinc-900/60
                                    shadow-sm shadow-black/20
                                    transition-all duration-200
                                    hover:-translate-y-0.5
                                    hover:border-zinc-700
                                    hover:bg-zinc-900
                                    hover:shadow-lg hover:shadow-black/30
                                "
                            >
                                <div className="relative h-36 overflow-hidden border-b border-zinc-800/80 bg-zinc-950">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.10),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent_35%)]" />

                                    <div className="relative flex h-8 items-center gap-1.5 border-b border-zinc-800/80 bg-zinc-900/70 px-3">
                                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                                        <span className="h-2 w-2 rounded-full bg-zinc-700" />

                                        <div className="ml-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
                                            <VscVscode />
                                            <span>{item?.language || "project"}</span>
                                        </div>
                                    </div>

                                    <div className="relative flex h-[calc(100%-2rem)] flex-col justify-center px-5">
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                                                <VscVscode size={15} />
                                            </div>

                                            <span className="text-xs font-medium text-zinc-500">
                                                {item?.language?.toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="capitalize truncate text-sm font-semibold text-zinc-200">
                                            {item?.name}
                                        </h3>

                                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
                                            {item?.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="pointer-events-none absolute inset-0 bg-white/[0.02] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                </div>

                                <div className="flex flex-1 flex-col px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="capitalize truncate text-sm font-medium text-zinc-100">
                                                {item?.name}
                                            </h2>

                                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-600">
                                                <VscCalendar size={12} />
                                                <span>
                                                    Updated{" "}
                                                    {item?.updated_at?.split("T")[0] ||
                                                        "Unknown"}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            title={
                                                hasDevice
                                                    ? "Device assigned"
                                                    : "No device assigned"
                                            }
                                            className={`
                                                flex h-7 w-7 shrink-0 items-center justify-center
                                                rounded-lg border
                                                ${
                                                    hasDevice
                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                        : "border-zinc-700/70 bg-zinc-800/60 text-zinc-500"
                                                }
                                            `}
                                        >
                                            {hasDevice ? (
                                                <VscChip size={15} />
                                            ) : (
                                                <VscLockSmall size={15} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex min-h-[30px] items-center">
                                        {hasDevice ? (
                                            <div className="flex max-w-full items-center gap-2 rounded-md bg-emerald-500/5 px-2 py-1 text-[10px] text-emerald-400/80">
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                                <span className="truncate">
                                                    {item.device_id}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-600">
                                                No device connected
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800/70 pt-3">
                                        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                                            Project #{item?.id}
                                        </span>

                                        <Link
                                            to={`/project/${item?.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                group/open flex items-center gap-1.5
                                                rounded-lg border border-zinc-700
                                                bg-zinc-800/70 px-2.5 py-1.5
                                                text-xs font-medium text-zinc-300
                                                transition-all
                                                hover:border-purple-500/40
                                                hover:bg-purple-500/10
                                                hover:text-purple-300
                                            "
                                        >
                                            Open
                                            <VscArrowRight
                                                size={13}
                                                className="transition-transform group-hover/open:translate-x-0.5 group-hover/open:-translate-y-0.5"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : loading ? 
                <div className="w-full h-full min-h-64 flex items-center justify-center">
                    <div className="p-3 border-2 border-t-transparent border-purple-500 rounded-full animate-spin">
                    </div>
                </div>
                :
                (
                <div className="flex h-full min-h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-600">
                            <VscVscode size={19} />
                        </div>

                        <p className="text-sm text-zinc-400">
                            No projects found
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                            Create a project to get started.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}