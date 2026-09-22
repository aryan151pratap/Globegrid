import { sendToBackend, connectDashboard, disconnectDashboard } from "../../services/deviceService";

export const connectToDashboard = ({ device_id, onRunnerData, onStatus, onError }) => {
	try {
		disconnectDashboard();
		connectDashboard(
			(data) => {
				const type = data.type;

				if (type == "runner_data") {
					if (device_id && data.device_id && String(data.device_id) !== String(device_id)) return;
					onRunnerData?.(data.data);      // the dict the device passed to send_json()
				}
				else if (type == "error") onError?.(data.data);
				// terminal / IOT / filesystem are handled by the Editor, not the preview
			},
			(connected) => {
				console.log("Terminal connection:", connected);
				onStatus?.(connected);
			}
		);
	} catch (err) {
		onError?.(err.message);
	}
};

export const disconnectFromDashboard = () => disconnectDashboard();

export const sendRunnerData = (deviceId, payload) => {
	sendToBackend({
		type: "runner",
		device_id: deviceId,
		data: payload,
	});
};