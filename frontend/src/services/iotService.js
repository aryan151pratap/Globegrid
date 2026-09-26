import { API } from "./authService";

export const getDevices = async () => {
	try{
		const res = await API.get("/devices/available");
		return res.data;
	} catch (err) {
		return null;
	}
}

export const addDevice = async (data) => {
	try{
		const res = await API.post("/devices/add", data);
		return res;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export const AddedDevice = async () => {
	try{
		const res = await API.get("/devices/added");
		return res.data;
	} catch (err) {
		console.log(err);
	}
}

export const DeleteDevice = async (device_id) => {
	try{
		const res = await API.delete(`/device/delete/${device_id}`);
		console.log(res);
		return res;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export const getESP = async (deviceId) => {
	const res = await API.get(`/device/${deviceId}`);
	return res.data;
};

export const getconnection = async (deviceId) => {
	const res = await API.get(`/device/connection/${deviceId}`);
	return res.data;
};

export const getFolder = async (deviceId, path) => {
	try {
		const res = await API.post(`device/folder/${deviceId}`, null, { params: { path } });
		if(res) return res.data;
	} catch (err) {
		throw err;
	}
}

export async function ScanDeviceWifi(deviceId) {
	try {
		const res = await API.get(`device/wifiScan/${deviceId}`);
		if(res) return res.data;
	} catch (err) {
		throw err;
	}
}

export async function ConnectDeviceWifi(deviceId, ssid, password) {
	try {
		const res = await API.post(`device/wifiConnect/${deviceId}`, {
			ssid, password
		});
		if(res) return res.data;
	} catch (err) {
		throw err;
	}
}

export async function GetWifiStatus(deviceId) {
	try {
		const res = await API.get(`device/wifiStatus/${deviceId}`);
		console.log(res);
		if(res) return res.data;
	} catch (err) {
		throw err;
	}
}