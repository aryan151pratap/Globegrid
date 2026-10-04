import { API } from "../services/authService";

export const send_otp = async (email) => {
	try {
	const res = await API.post("/auth/send-otp", {email});
		return res.data;
	} catch (err) {
		console.error("Send OTP Error:", err.response?.data || err.message);
		return null;
	}
};

export const verify_otp = async (email, otp) => {
	try {
		const res = await API.post("/auth/verify-otp", {email, otp});
		return res.data;
	} catch (err) {
		console.error("Verify OTP Error:", err.response?.data || err.message);
		return null;
	}
};

export const reset_password = async (email, reset_token, new_password) => {
	console.log(reset_token);
	const res = await API.post("/password-reset", { email, password: new_password });
	return res.data;
};