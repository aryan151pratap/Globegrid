import { useState } from "react";
import { loginUser, signupUser } from "../../services/authService.js";
import { Link, useNavigate } from "react-router-dom";
import { useNotify } from "../Device-IDE/notify.jsx";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Otp from "./otp.jsx";
import { VscCheck } from "react-icons/vsc";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showOtp, setShowOtp] = useState(false);
	const [verifyOtp, setVerifyOtp] = useState(null);

	const notify = useNotify();

	const handleChange = (e) => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			let data;

			if (isLogin) {
				data = await loginUser(form.email, form.password);

				notify({
					type: "status",
					message: `${data?.email} ${data?.message}`
				});

				navigate("/dashboard");
			} else {
				if (form.password !== form.confirmPassword) {
					setError("Passwords do not match");
					return;
				}

				data = await signupUser(
					form.name,
					form.email,
					form.password
				);

				navigate("/login");
			}

			console.log("Server response:", data);
		} catch (err) {
			console.log(err);

			notify({
				type: "error",
				message: err?.response?.data?.detail
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="h-screen w-full bg-zinc-900 text-white flex flex-col items-center font-inter p-4">
			<header className="p-4 w-full">
				<h1 className="text-xl">
					<span className="font-bold">ESP32 Manager</span>
				</h1>
			</header>

			<main className="md:w-[440px] sm:w-[400px] w-fit flex flex-col h-full justify-center">
				<div className="grid grid-cols-2 gap-2 w-full text-sm">
					<button type="button" className="w-full flex flex-row items-center justify-center gap-2 px-4 mb-2 p-2 border border-zinc-400 text-zinc-200 hover:bg-white hover:text-black hover:border-white">
						<FcGoogle className="h-5 w-5"/>
						<span>Google</span>
					</button>
					<button type="button" className="w-full flex flex-row items-center justify-center gap-2 px-4 mb-2 p-2 border border-zinc-400 text-zinc-200 hover:bg-white hover:text-black hover:border-white">
						<FaGithub className="h-5 w-5"/>
						<span>Github</span>
					</button>
				</div>

				<p className="w-full flex flex-col items-center mb-2 text-sm">OR</p>

				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

					{!isLogin && (
						<div className="flex flex-col gap-1 text-sm">
							<label htmlFor="name">
								Full name
							</label>

							<input
								id="name"
								type="text"
								name="name"
								required
								placeholder="John Doe"
								value={form.name}
								onChange={handleChange}
								className="outline-none border border-zinc-500 p-2 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
							/>
						</div>
					)}

					<div className="flex flex-col gap-2 text-sm">
						<label htmlFor="email" className="">
							Email
						</label>

						<input
							id="email"
							type="email"
							name="email"
							required
							placeholder="you@example.com"
							disabled={verifyOtp?.email == form?.email}
							value={form.email}
							onChange={handleChange}
							className="outline-none border border-zinc-500 p-2 disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:border-green-500/20 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
						/>
						{!isLogin && form?.email && (
							<div className="capitalize text-sm w-full flex flex-col gap-2">
								{verifyOtp?.email == form?.email ?
								<div className="w-fit flex flex-row text-xs bg-green-500/60 gap-2 px-2 p-1 items-center text--500">
									<VscCheck size={16}/>
									<span>verified</span>
								</div>
								:
								<button
									type="button"
									className="text-xs w-fit p-1 px-2 bg-green-500/80 hover:bg-green-500/60"
									onClick={() => setShowOtp(true)}
								>
									Verify Email
								</button>
								}
							</div>
						)}
					</div>

					<div className="w-full flex flex-row gap-2 text-sm">
						<div className="w-full flex flex-col gap-2">
							<div className="w-full flex flex-row justify-between">
								<label htmlFor="password">
									Password
								</label>

								{isLogin && (
									<Link to={"/password-reset"} type="button"
										className="hover:text-orange-400 hover:underline"
									>
										Forgot password?
									</Link>
								)}
							</div>

							<input
								id="password"
								type="password"
								name="password"
								required
								placeholder="Password"
								value={form.password}
								onChange={handleChange}
								className="w-full outline-none border border-zinc-500 p-2 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
							/>
						</div>
						{!isLogin && (
							<div className="w-full flex flex-col gap-2">
								<label htmlFor="confirmPassword">
									Confirm password
								</label>
								<input
									id="confirmPassword"
									type="password"
									name="confirmPassword"
									required
									placeholder="Confirm password"
									value={form.confirmPassword}
									onChange={handleChange}
									className="w-full outline-none border border-zinc-500 p-2 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
								/>
							</div>
						)}
					</div>
					
					{showOtp && (
						<Otp
							userEmail={form.email}
							onClose={() => setShowOtp(false)}
							verify={setVerifyOtp}
						/>
					)}

					{isLogin && (
						<label className="flex flex-row gap-2 items-center text-[13px]">
							<input
								type="checkbox"
								name="remember"
								className="cursor-pointer"
							/>
							Remember me
						</label>
					)}

					{error && (
						<p className="text-xs p-2 border border-red-500/40 bg-zinc-500/10">{error}</p>
					)}

					<button
						type="submit"
						disabled={loading || (!isLogin && (verifyOtp?.email !== form?.email))}
						className="p-2 bg-purple-500/80 hover:bg-purple-500/50 disabled:bg-purple-500/40 disabled:cursor-not-allowed w-fit text-sm"
					>
						{loading
							? "Please wait..."
							: isLogin
								? "Sign in" 
								: "Create account"
							}
					</button>
				</form>

				<div className="flex flex-row gap-2 text-sm mt-4">
					<p>
						{isLogin
							? "Don't have an account?"
							: "Already have an account?"}
					</p>

					<button
						type="button"
						className="text-purple-400 hover:underline"
						onClick={() => {
							setIsLogin(!isLogin);
							setError("");
						}}
					>
						{isLogin ? "Sign up" : "Sign in"}
					</button>
				</div>
			</main>
		</div>
	);
}