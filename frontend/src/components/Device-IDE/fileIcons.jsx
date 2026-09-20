import { VscFileCode, VscJson, VscMarkdown, VscCode, VscPython } from "react-icons/vsc";
import { SiReact } from "react-icons/si";

export const getFileIcon = (name, size = 14) => {
	const extension = name?.split(".").pop();
	switch (extension) {
		case "js":
			return <span className="text-yellow-500 capitalize">js</span>;
		case "jsx":
			return <SiReact size={size} className="text-cyan-400" />;
		case "tsx":
			return <SiReact size={size} className="text-blue-400" />;
		case "ts":
			return <VscFileCode size={size} className="text-blue-500" />;
		case "py":
			return <VscPython size={size} className="text-blue-400" />;
		case "json":
			return <VscJson size={size} className="text-yellow-300" />;
		case "md":
			return <VscMarkdown size={size} className="text-blue-300" />;
		case "html":
			return <VscCode size={size} className="text-orange-500" />;
		default:
			return <VscFileCode size={size} className="text-zinc-400" />;
	}
};