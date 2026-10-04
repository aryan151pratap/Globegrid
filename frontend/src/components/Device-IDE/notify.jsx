import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const TYPES = {
	success: { icon: CheckCircle2, text: "text-emerald-400", ring: "ring-emerald-400/20", bar: "bg-emerald-400" },
	error: { icon: XCircle, text: "text-rose-400", ring: "ring-rose-400/20", bar: "bg-rose-400" },
	warning: { icon: AlertTriangle, text: "text-amber-400", ring: "ring-amber-400/20", bar: "bg-amber-400" },
	info: { icon: Info, text: "text-sky-400", ring: "ring-sky-400/20", bar: "bg-sky-400" },
};

const NotifyContext = createContext(null);
let uid = 0;

export function NotifyProvider({ children }) {
	const [toast, setToast] = useState(null);

	const dismiss = useCallback((id) => {
		setToast((prev) => (prev && prev.id === id ? null : prev));
	}, []);

	const notify = useCallback(({ type = "info", message, duration = 4000 }) => {
		const id = ++uid;
		setToast({ id, type, message, duration });
		return id;
	}, []);

	return (
		<NotifyContext.Provider value={notify}>
			{children}
			<div className="pointer-events-none fixed bottom-2 right-0 z-[100] px-2 flex flex-col gap-2">
				{toast && <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />}
			</div>
		</NotifyContext.Provider>
	);
}

export function useNotify() {
	const ctx = useContext(NotifyContext);
	if (!ctx) throw new Error("useNotify must be used inside a NotifyProvider");
	return ctx;
}

function Toast({ type, message, duration, onDismiss }) {
	const [show, setShow] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [depleted, setDepleted] = useState(false);
	const cfg = TYPES[type] || TYPES.info;
	const Icon = cfg.icon;

	const close = useCallback(() => {
		setLeaving(true);
		setTimeout(onDismiss, 200);
	}, [onDismiss]);

	useEffect(() => {
		const raf = requestAnimationFrame(() => {
			setShow(true);
			setDepleted(true);
		});
		const timer = setTimeout(close, duration);
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timer);
		};
	}, [duration, close]);

	return (
		<div
			className={`pointer-events-auto w-80 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/90 shadow-xl shadow-black/40 backdrop-blur ring-1 ${cfg.ring} transition-all duration-200 ${
				show && !leaving ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
			}`}
		>
			<div className="flex items-start gap-2.5 px-3.5 py-3">
				<Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.text}`} />
				<p className="flex-1 text-sm leading-snug text-neutral-200">{message}</p>
				<button onClick={close} className="shrink-0 text-neutral-500 hover:text-neutral-300">
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
			<div className="h-0.5 bg-white/5">
				<div
					className={`h-full ${cfg.bar} transition-[width] ease-linear`}
					style={{ width: depleted ? "0%" : "100%", transitionDuration: `${duration}ms` }}
				/>
			</div>
		</div>
	);
}

export default NotifyProvider;