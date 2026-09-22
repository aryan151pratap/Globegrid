import { useEffect, useRef } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import { connectToDashboard, disconnectFromDashboard, sendRunnerData } from "./connect";

export default function DeviceBridge({ device_id, setBackendConnection }) {
	const { sandpack } = useSandpack();
	const ref = useRef(sandpack);
	ref.current = sandpack;

	useEffect(() => {
		let last = null;

		const iframes = () =>
			Object.values(ref.current.clients).map((c) => c.iframe?.contentWindow);
		const toSandbox = (win, data) =>
			win?.postMessage({ source: "esp-bridge", type: "runner_data", data }, "*");

		connectToDashboard({
			device_id,
			onRunnerData: (data) => {
				last = data;
				iframes().forEach((w) => toSandbox(w, data));
			},
			onStatus: setBackendConnection,
			onError: (msg) => console.error("Device error:", msg),
		});

		// SEND: iframe -> connection
		const onWindowMsg = (e) => {
			if (!iframes().includes(e.source)) return;
			if (e.data?.source !== "esp-bridge") return;

			if (e.data.type === "hello" && last !== null) {
				toSandbox(e.source, last);
			}
			if (e.data.type === "runner") {
				sendRunnerData(device_id, e.data.data);
			}
		};
		window.addEventListener("message", onWindowMsg);

		return () => {
			window.removeEventListener("message", onWindowMsg);
			disconnectFromDashboard();
		};
	}, [device_id]);

	return null;
}