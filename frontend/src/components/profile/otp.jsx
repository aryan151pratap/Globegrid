import { useEffect, useState } from "react";
import { send_otp, verify_otp } from "../../hooks/otp";

export default function Otp({ userEmail, onClose, verify }) {
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState("send");
	const [loading, setLoading] = useState(false);

	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const [expiresAt, setExpiresAt] = useState(null);
	const [now, setNow] = useState(Date.now());

	const email = userEmail?.trim() || "";

	useEffect(() => {
		if (!expiresAt) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [expiresAt]);

	const secondsLeft = expiresAt
		? Math.max(0, Math.ceil((expiresAt - now) / 1000))
		: 0;
	const expired = step === "otp" && secondsLeft === 0;
	const timeText = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
		secondsLeft % 60
	).padStart(2, "0")}`;

	const sendOtp = async () => {
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await send_otp(email);
			if (response?.success) {
				setStep("otp");
				setMessage(response.message);
				setOtp("");
				setNow(Date.now());
				setExpiresAt(Date.now() + (response.expires_in ?? 300) * 1000);
			} else {
				setError("Failed to send OTP");
			}
		} catch (err) {
			setError(err.response?.data?.detail || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const verifyOtp = async () => {
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await verify_otp(email, otp);
			if (response?.verified) {
				setStep("success");
				setMessage(response.message);
				setExpiresAt(null);
				verify?.({ email });
			} else {
				setError("Invalid or expired OTP");
			}
		} catch (err) {
			setError(err.response?.data?.detail || "Invalid OTP");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] bg-black/60 p-4"
			onClick={() => onClose?.()}
		>
			<div
				className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-white"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={() => onClose?.()}
					aria-label="Close"
					className="absolute top-3 right-4 text-zinc-400 hover:text-white text-2xl leading-none"
				>
					×
				</button>

				<h2 className="text-lg font-semibold mb-5">Verify Email</h2>

				{step === "send" && (
					<div className="space-y-5">
						{email ? (
							<p className="text-sm text-zinc-400 text-center">
								We'll send a 6-digit code to
								<br />
								<span className="text-white">{email}</span>
							</p>
						) : (
							<p className="text-sm text-red-400 text-center">
								Please enter your email first.
							</p>
						)}

						<button
							type="button"
							onClick={sendOtp}
							disabled={loading || !email}
							className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 font-medium"
						>
							{loading ? "Sending..." : "Send OTP"}
						</button>
					</div>
				)}

				{step === "otp" && (
					<div className="space-y-5">
						<p className="text-sm text-zinc-400 text-center">
							Enter the 6-digit OTP sent to
							<br />
							<span className="text-white">{email}</span>
						</p>

						<p
							className={`text-center text-sm ${
								expired ? "text-red-400" : "text-zinc-400"
							}`}
						>
							{expired ? "OTP expired. Please resend." : `Expires in ${timeText}`}
						</p>

						<input
							type="text"
							inputMode="numeric"
							maxLength={6}
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							placeholder="000000"
							className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-purple-500"
						/>

						<button
							type="button"
							onClick={verifyOtp}
							disabled={loading || otp.length !== 6 || expired}
							className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 font-medium"
						>
							{loading ? "Verifying..." : "Verify OTP"}
						</button>

						<button
							type="button"
							onClick={sendOtp}
							disabled={loading}
							className="w-full text-sm text-purple-400 hover:text-purple-300"
						>
							Resend OTP
						</button>
					</div>
				)}

				{step === "success" && (
					<div className="text-center space-y-4">
						<div className="text-5xl text-green-500">✓</div>
						<h3 className="text-xl font-semibold">Email Verified!</h3>
						<p className="text-zinc-400 text-sm">
							Your email has been successfully verified.
						</p>
						<button
							type="button"
							onClick={() => onClose?.()}
							className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-medium"
						>
							Done
						</button>
					</div>
				)}

				{message && (
					<p className="text-green-400 text-sm text-center mt-5">{message}</p>
				)}

				{error && (
					<p className="text-red-400 text-sm text-center mt-5">{error}</p>
				)}
			</div>
		</div>
	);
}