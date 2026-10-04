import { useState } from "react";
import Otp from "./otp.jsx";
import { reset_password } from "../../hooks/otp";
import { Link } from "react-router-dom";

export default function Reset({ userEmail = "" }) {
	const [step, setStep] = useState("email");
	const [email, setEmail] = useState(userEmail);
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const cleanEmail = email.trim();
	const passwordTooShort = password.length > 0 && password.length < 8;
	const mismatch = confirm.length > 0 && password !== confirm;
	const canReset = password.length >= 8 && password === confirm;

	const handleReset = async () => {
		setLoading(true);
		setError("");

		try {
			const response = await reset_password(cleanEmail, token, password);
			if (response?.success) {
				setStep("success");
			} else {
				setError("Failed to reset password");
			}
		} catch (err) {
			setError(err.response?.data?.detail || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	if (step === "otp") {
		return (
			<Otp
				userEmail={cleanEmail}
				verify={(data) => {
					setToken(data.reset_token);
					setStep("password");
				}}
			/>
		);
	}

	return (
		<div className="w-full h-screen z-50 flex items-center justify-center bg-black p-4">
			<div
				className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-white"
				onClick={(e) => e.stopPropagation()}
			>

				<h2 className="text-lg font-semibold mb-5">Reset Password</h2>

				{step === "email" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm mb-2">Email Address</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@gmail.com"
								className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
							/>
						</div>

						<button
							type="button"
							onClick={() => setStep("otp")}
							disabled={!cleanEmail}
							className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 font-medium"
						>
							Continue
						</button>
					</div>
				)}

				{step === "password" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm mb-2">New Password</label>
							<input
								type="password"
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="At least 8 characters"
								className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
							/>
							{passwordTooShort && (
								<p className="text-xs text-red-400 mt-1">
									Password must be at least 8 characters
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm mb-2">Confirm Password</label>
							<input
								type="password"
								autoComplete="new-password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								placeholder="Confirm password"
								className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
							/>
							{mismatch && (
								<p className="text-xs text-red-400 mt-1">
									Passwords do not match
								</p>
							)}
						</div>

						<button
							type="button"
							onClick={handleReset}
							disabled={loading || !canReset}
							className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 font-medium"
						>
							{loading ? "Resetting..." : "Reset Password"}
						</button>
					</div>
				)}

				{step === "success" && (
					<div className="text-center space-y-4">
						<div className="text-5xl text-green-500">✓</div>
						<h3 className="text-xl font-semibold">Password Reset!</h3>
						<p className="text-zinc-400 text-sm">
							You can now sign in with your new password.
						</p>
						<Link to={"/login"}
							type="button"
							className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-medium"
						>
							Done
						</Link>
					</div>
				)}

				{error && (
					<p className="text-red-400 text-sm text-center mt-5">{error}</p>
				)}
			</div>
		</div>
	);
}