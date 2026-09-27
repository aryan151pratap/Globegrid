import axios from "axios";

export const API = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// Login
export const loginUser = async (email, password) => {
	try{
		const response = await API.post("/login", {
			email,
			password,
		});

		return response.data;
	} catch (error) {
		throw error;
	}
};

// Signup
export const signupUser = async (name, email, password) => {
	const response = await API.post("/signup", {
		name,
		email,
		password,
	});
	
	return response.data;
};

export const me = async () => {
	try {
		const response = await API.get("/me");
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const get_user_details = async () => {
	try {
		const response = await API.get("/user_details");
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const logout = async () => {
	try {
		const response = await API.post("/logout");
		return response.data;
	} catch (error) {
		throw error;
	}
};
