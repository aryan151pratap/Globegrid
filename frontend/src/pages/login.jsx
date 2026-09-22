import { useState } from "react";
import { loginUser, signupUser } from "../services/authService.js";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../components/Device-IDE/notify.jsx";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

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
				message: err.message
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

				{/* <h2>
					{isLogin
						? "Welcome back"
						: "Create your account"}
				</h2>

				<p>
					{isLogin
						? "Sign in to continue to your account"
						: "Get started with your account today"}
				</p> */}
			</header>

			<main className="w-[440px] flex flex-col h-full justify-center">
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
							placeholder="you@example.com"
							value={form.email}
							onChange={handleChange}
							className="outline-none border border-zinc-500 p-2 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
						/>
					</div>

					<div className="w-full flex flex-row gap-2 text-sm">
						<div className="w-full flex flex-col gap-2">
							<div className="w-full flex flex-row justify-between">
								<label htmlFor="password">
									Password
								</label>

								{isLogin && (
									<button type="button"
										className="hover:text-orange-400 hover:underline"
									>
										Forgot password?
									</button>
								)}
							</div>

							<input
								id="password"
								type="password"
								name="password"
								placeholder="Password"
								value={form.password}
								onChange={handleChange}
								className="outline-none border border-zinc-500 p-2 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
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
									placeholder="Confirm password"
									value={form.confirmPassword}
									onChange={handleChange}
									className="outline-none border border-zinc-500 p-2 bg-zinc-900 text-white placeholder:text-zinc-500 focus:text-zinc-100 focus:border-purple-400/60 hover:border-zinc-400"
								/>
							</div>
						)}
					</div>


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
						<p className="p-2 border border-red-400/90 hover:border-red-500">{error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="p-2 bg-purple-500/80 hover:bg-purple-500/50 disabled:bg-purple-500/40 disabled:cursor-not-allowed w-fit text-sm"
					>
						{loading
							? "Please wait..."
							: isLogin
								? "Sign in"
								: "Create account"}
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