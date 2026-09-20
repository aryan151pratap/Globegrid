import { useEffect, useState } from "react";
import { data } from "./data";
import ViewReactProject from "./reactCode";
import { useParams } from "react-router-dom";
import { get_project } from "../../hooks/projectHandle";

const Show = () => {
	const [files, setFiles] = useState(null);
	const { project_id } = useParams();
	const projectId = Number(project_id);
	useEffect(() => {
		get_project_files();
	}, []);

	const get_project_files = async function(){
		try{
			const res = await get_project(projectId);
			console.log(res);
			if(!res) return;
			setFiles(res.files);
		} catch (err) {
			console.log(err);
		}
	}
	if (!files) {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-black text-gray-400">
				Loading project...
			</div>
		);
	}

	return (
		<div className="h-screen w-full flex flex-col bg-black">
			<div className="text-white px-2 p-1 text-xs">
				<div>
					<button>
						Refreah
					</button>
				</div>
			</div>
			<ViewReactProject files={files} />
		</div>
	);
};

export default Show;