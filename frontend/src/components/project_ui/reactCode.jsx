import { SandpackProvider, SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";
import { useMemo } from "react";


const ViewReactProject = ({ files }) => {
	const sandpackFiles = useMemo(() => {
		const out = {};
		Object.entries(files || {}).forEach(([path, content]) => {
			if (typeof content === "string") out[path] = content;
		});
		return out;
	}, [files]);

	return (
		<div style={{ width: "100%"}} className="h-full w-full">
			<SandpackProvider
				template="react"
				theme="dark"
				files={sandpackFiles}
				customSetup={{ entry: "/main.jsx" }}
				options={{ externalResources: ["https://cdn.tailwindcss.com"] }}
				style={{ height: "100%", width: "100%" }}
			>
				<SandpackLayout style={{ height: "100%", width: "100%", border: "none", borderRadius: 0 }}>
				<SandpackPreview
					showNavigator={false}
					showOpenInCodeSandbox={false}
					showRefreshButton={false}
					style={{ height: "100%", width: "100%" }}
				/>
				</SandpackLayout>
			</SandpackProvider>
		</div>
	);
};

export default ViewReactProject;