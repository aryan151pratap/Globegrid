import { useCallback, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiTrash } from "react-icons/fi";
import { VscFileCode, VscFolder, VscFolderOpened, VscJson, VscMarkdown, VscPython } from "react-icons/vsc";

function joinPath(parentPath, name) {
	if (!parentPath || parentPath === "/") return `/${name}`;
	return `${parentPath}/${name}`;
}

function getParentPath(path) {
	if (!path) return "/";
	const idx = path.lastIndexOf("/");
	if (idx <= 0) return "/";
	return path.slice(0, idx);
}

function getFileIcon(name = "") {
	const ext = name.split(".").pop().toLowerCase();
	if (ext === "py") return <VscPython size={14} className="shrink-0 text-sky-400" />;
	if (ext === "json") return <VscJson size={14} className="shrink-0 text-yellow-500" />;
	if (ext === "md") return <VscMarkdown size={14} className="shrink-0 text-zinc-400" />;
	return <VscFileCode size={14} className="shrink-0 text-zinc-500" />;
}

function sortEntries(entries = []) {
	return [...entries].sort((a, b) => {
		if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
}


export default function FileManager({
	files = [],
	activeFile,
	onFileSelect,
	currentFolder,
	onFolderChange,
	onLoadFolder,
	handleDelete
}) {
	const [expanded, setExpanded] = useState(() => new Set(["/"]));
	const [loadedChildren, setLoadedChildren] = useState({});
	const [loadingPaths, setLoadingPaths] = useState(() => new Set());
	useEffect(() => {
		setLoadedChildren({});
	}, [files]);

	const activePath = typeof activeFile === "string" ? activeFile : activeFile?.path;

	const toggleFolder = useCallback(
		async (node) => {
			const isOpen = expanded.has(node.path);
			const next = new Set(expanded);

			if (isOpen) {
				next.delete(node.path);
				setExpanded(next);
				return;
			}
			next.add(node.path);
			setExpanded(next);

			const alreadyHasChildren = node.children || loadedChildren[node.path];
			if (!alreadyHasChildren && onLoadFolder) {
				setLoadingPaths((prev) => new Set(prev).add(node.path));
				try {
					const children = await onLoadFolder(node.path);
					if(!children) return;
					setLoadedChildren((prev) => ({ ...prev, [node.path]: children || [] }));
				} catch (err) {
					console.log(err);
				} finally {
					setLoadingPaths((prev) => {
						const s = new Set(prev);
						s.delete(node.path);
						return s;
					});
				}
			}
		},
		[expanded, loadedChildren, onLoadFolder]
	);

	const handleSelect = (node) => {
		if (node.type === "folder") {
			onFolderChange?.(node.path);
			toggleFolder(node);
			return;
		}
		onFileSelect?.(node);
		onFolderChange?.(getParentPath(node.path));
	};

	
	const renderNode = (rawNode, parentPath, depth) => {
		const path = rawNode.path || joinPath(parentPath, rawNode.name);
		const node = { ...rawNode, path };

		const isFolder = node.type === "folder";
		const isOpen = expanded.has(path);
		const isActiveFile = !isFolder && path === activePath;
		const isActiveFolder = isFolder && path === currentFolder;
		const children = node.children ?? loadedChildren[path];
		const isLoading = loadingPaths.has(path);

		return (
			<div key={path}>
				<div
					style={{ paddingLeft: depth * 14 + 8 }}
					title={path}
					className={`group flex h-6 cursor-pointer items-center gap-1.5 pr-2 text-[13px] transition ${
						isActiveFile ? "bg-zinc-900 text-white" : isActiveFolder
							? "bg-zinc-600/20 text-white"
							: "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
					}`}
				>
					{isFolder ? (
						<div className="flex flex-row gap-1 items-center">
							{isOpen ? (
								<FiChevronDown size={14} className="shrink-0 text-zinc-500" />
							) : (
								<FiChevronRight size={14} className="shrink-0 text-zinc-500" />
							)}
							{isOpen ? (
								<VscFolderOpened size={14} className="shrink-0 text-zinc-500" />
							) : (
								<VscFolder size={14} className="shrink-0 text-zinc-500" />
							)}
						</div>
					) : (
						<>
							<span className="w-[13px] shrink-0" />
							{getFileIcon(node.name)}
						</>
					)}

					<span className="truncate w-full"
						onClick={() => handleSelect(node)}
					>{node.name}</span>

					{isLoading && <span className="ml-auto text-[10px] text-zinc-600">loading…</span>}
					{(!isFolder || (isFolder && isOpen && children == undefined)) &&
					<div className="opacity-0 group-hover:opacity-90 p-1 hover:text-red-500/80 transition text-zinc-500/50 ml-auto"
						onClick={() => handleDelete(node.path)}
					>
						<FiTrash/>
					</div>
					}
				</div>

				{isFolder && isOpen && children !== undefined && (
					<div>
						{children.length === 0 ? (
							<div
								style={{ paddingLeft: (depth + 1) * 14 + 8 }}
								className="flex h-6 items-center text-[12px] text-zinc-600"
							>
								empty
							</div>
						) : (
							sortEntries(children).map((child) => renderNode(child, path, depth + 1))
						)}
					</div>
				)}
			</div>
		);
	};

	if (!files || files.length === 0) {
		return <div className="text-[12px] text-white/80 px-1 p-2">
			<span className="bg-purple-500/50 px-2 p-1">No files</span>
		</div>;
	}

	return <div className="py-1">{sortEntries(files).map((node) => renderNode(node, "/", 0))}</div>;
}