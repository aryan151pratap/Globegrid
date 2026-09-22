import { API } from "../services/authService";

export const get_template = async (name) => {
	try {
		const res = await API.get(`/project/template/${encodeURIComponent(name)}`);
		return res.data;
	} catch (err) {
		console.error("Failed to save project:", err);
		return null;
	}
};
 
export const save_project = async (project) => {
	try {
		const res = await API.post("/project/save", {
			name: project.name,
			description: project.description,
			files: project.files,
			language: project.language,
			device_id: project.device_id,
		});
		return res.data;
	} catch (err) {
		console.error("Failed to save project:", err);
		return null;
	}
};

export const get_project = async (project_id) => {
	try {
		const res = await API.get(`/project/${project_id}`);
		return res.data;
	} catch (err) {
		console.error("Failed to get project:", err);
		return null;
	}
};

export const list_projects = async () => {
	try {
		const res = await API.get("/projects");
		return res.data;
	} catch (err) {
		console.error("Failed to list projects:", err);
		return null;
	}
};

export const all_projects_files = async () => {
	try {
		const res = await API.get("/projects/with_files");
		return res.data;
	} catch (err) {
		console.error("Failed to list projects:", err);
		return null;
	}
};

export const update_project = async (project_id, project) => {
	try {
		const res = await API.put(`/project/${project_id}`, {
			name: project.name,
			description: project.description,
			files: project.files,
			language: project.language,
			device_id: project.device_id,
		});

		return res.data;
	} catch (err) {
		console.error("Failed to update project:", err);
		return null;
	}
};

export const update_project_details = async (project_id, project) => {
	try {
		const res = await API.put(`/project/${project_id}/details`, {
			name: project.name,
			description: project.description,
			language: project.language,
			device_id: project.device_id,
		});

		return res.data;
	} catch (err) {
		console.error("Failed to update project:", err);
		return null;
	}
};	

export const delete_project = async (project_id) => {
	try {
		const res = await API.delete(`/project/${project_id}`);
		return res.data;
	} catch (err) {
		console.error("Failed to delete project:", err);
		return null;
	}
};

// Single-file operations — these back saveActiveFile's PROJECT branch and
// any "delete this file" action in the explorer. Both need project_id
// alongside the file itself, since a file has no identity on its own.

export const save_file = async (project_id, file) => {
	try {
		const res = await API.put(`/project/${project_id}/files`, {
			path: file.path,
			name: file.name,
			content: file.content,
		});

		return res.data;
	} catch (err) {
		console.error("Failed to save file:", err);
		return null;
	}
};

export const delete_file = async (project_id, path) => {
	try {
		const res = await API.delete(`/project/${project_id}/files`, {
			params: { path },
		});

		return res.data;
	} catch (err) {
		console.error("Failed to delete file:", err);
		return null;
	}
};