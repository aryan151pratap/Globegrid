import { useEffect, useMemo, useState } from "react";
import { VscFolder, VscFolderOpened, VscChevronRight, VscChevronDown, VscCloseCompact, VscTrash } from "react-icons/vsc";
import { getFileIcon } from "../fileIcons";

const normalizePath = (p = "") => "/" + p.split("/").filter(Boolean).join("/");

const parentOf = (id) => {
	const parts = id.split("/").filter(Boolean).slice(0, -1);
	return parts.length ? "/" + parts.join("/") : null;
};

const buildTree = (files) => {
	const root = { children: [] };

	files.forEach((item) => {
		const parts = (item.path || "").split("/").filter(Boolean);
		let current = root;

		parts.forEach((part, index) => {
			const isLast = index === parts.length - 1;
			const id = "/" + parts.slice(0, index + 1).join("/");
			const wantFolder = !isLast || item.type === "folder";

			let existing = current.children.find(
				(child) => child.name === part && child.isFolder === wantFolder
			);

			if (!existing) {
				existing = isLast
					? { ...item, name: part, id, isFolder: wantFolder, children: [] }
					: { name: part, path: id, id, type: "folder", isFolder: true, children: [] };
				current.children.push(existing);
			}
			current = existing;
		});
	});

	const sortNodes = (nodes) =>
		[...nodes]
			.sort((a, b) => {
				if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
				return a.name.localeCompare(b.name);
			})
			.map((node) => ({ ...node, children: sortNodes(node.children) }));

	return sortNodes(root.children);
};

const FileTree = ({ nodes, openFolders, activeId, activeFolderId, onFolderClick, onFileClick, delete_file_folder }) => {
	return (
		<div className="flex flex-col">
			{nodes.map((node) => {
				const isFolder = node.isFolder;
				const isOpen = !!openFolders[node.id];
				const isActive = !isFolder && activeId === node.id;
				const isActiveFolder = isFolder && activeFolderId === node.id;

				return (
					<div key={node.id} className="flex flex-col">
						<div
							onClick={(e) => {
								e.stopPropagation();
								if (isFolder) onFolderClick(node.id);
								else onFileClick(node);
							}}
							className={`group/file flex cursor-pointer items-center rounded-sm px-1 py-0.5 text-[12px] transition-colors ${
								isActive
									? "bg-zinc-800 font-medium text-white"
									: isActiveFolder
									? "bg-zinc-900 text-zinc-100"
									: "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
							}`}
						>
							<span className="mr-1 flex w-4 shrink-0 items-center justify-center text-zinc-500">
								{isFolder &&
									(isOpen ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />)}
							</span>

							<span className="mr-1.5 flex shrink-0 items-center">
								{isFolder ? (
									isOpen ? (
										<VscFolderOpened size={14} className="text-blue-400" />
									) : (
										<VscFolder size={14} className="text-blue-400" />
									)
								) : (
									getFileIcon(node.name)
								)}
							</span>

							<span className="truncate">{node.name}</span>

							{(!isFolder || node.children.length === 0) && (
								<button
									className="ml-auto hidden group-hover/file:flex text-zinc-400 hover:text-red-500"
									onClick={(e) => {
										e.stopPropagation();
										delete_file_folder(node);
									}}
								>
									<VscTrash size={14}/>
								</button>
							)}
						</div>

						{isFolder && isOpen && node.children.length > 0 && (
							<div className="ml-[11px] border-l border-zinc-800 pl-2">
								<FileTree
									nodes={node.children}
									openFolders={openFolders}
									activeId={activeId}
									activeFolderId={activeFolderId}
									onFolderClick={onFolderClick}
									onFileClick={onFileClick}
									delete_file_folder={delete_file_folder}
								/>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default function UIFileExplorer({
	files = [],
	activeFile,
	onFileClick,
	activeFolder,
	setActiveFolder,
	setActiveFodler,
	delete_file_folder
}) {
	const changeActiveFolder = setActiveFolder || setActiveFodler;

	const [openFolders, setOpenFolders] = useState({});
	const tree = useMemo(() => buildTree(files), [files]);

	const activeId = useMemo(
		() => (activeFile?.path ? normalizePath(activeFile.path) : null),
		[activeFile]
	);
	const activeFolderId = activeFolder && activeFolder !== "/" ? normalizePath(activeFolder) : null;

	const handleFolderClick = (id) => {
		setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
		changeActiveFolder?.(id);
	};

	const handleFileClick = (node) => {
		changeActiveFolder?.(parentOf(normalizePath(node.path)));
		onFileClick?.(node);
	};

	useEffect(() => {
		if (!activeId) return;
		const parts = activeId.split("/").filter(Boolean).slice(0, -1);
		if (!parts.length) return;
		setOpenFolders((prev) => {
			const next = { ...prev };
			parts.forEach((_, i) => {
				next["/" + parts.slice(0, i + 1).join("/")] = true;
			});
			return next;
		});
		changeActiveFolder?.(parentOf(activeId));
	}, [activeId]);

	useEffect(() => {
		if (activeId) {
			const fileStillExists = files.some((f) => normalizePath(f.path) === activeId);
			if (!fileStillExists) onFileClick?.(null);
		}

		if (activeFolderId) {
			const prefix = activeFolderId.replace(/\/$/, "") + "/";
			const folderStillExists = files.some((f) => {
				const p = normalizePath(f.path);
				return p === activeFolderId || p.startsWith(prefix);
			});
			if (!folderStillExists) changeActiveFolder?.(null);
		}
	}, [files]);

	return (
		<div
			onClick={() => changeActiveFolder?.(null)}
			className="dark-scrollbar h-full w-full select-none overflow-auto bg-zinc-950 text-zinc-300"
		>
			<FileTree
				nodes={tree}
				openFolders={openFolders}
				activeId={activeId}
				activeFolderId={activeFolderId}
				onFolderClick={handleFolderClick}
				onFileClick={handleFileClick}
				delete_file_folder={delete_file_folder}
			/>
			<div className="mb-10" />
		</div>
	);
}