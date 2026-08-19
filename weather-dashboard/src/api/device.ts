import { API_BASE_URL } from '../config';
import type { Device, LatestReadings } from './types';

const getDevices = async (): Promise<Device[]> => {
    try {
        return await fetch(`${API_BASE_URL}/devices`).then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

const getDevice = async (deviceUid: string): Promise<Partial<Device>> => {
    try {
        return await fetch(`${API_BASE_URL}/devices/${deviceUid}`).then((response) => response.json());
    } catch (error) {
        console.error('Error fetching device summary:', error);
        return {};
    }
};

const getLatestReadingsForDeviceUid = async (deviceUid: string): Promise<LatestReadings> => {
    try {
        return await fetch(`${API_BASE_URL}/readings/latest/${deviceUid}`).then((response) => response.json());
    } catch (error) {
        console.error('Error fetching latest readings:', error);
        return {};
    }
};

interface DeviceUpdatePayload {
    deviceUid: string;
    deviceName: string;
    locationUid: string;
}

const postDeviceChanges = async (payload: DeviceUpdatePayload): Promise<unknown> => {
    try {
        return await fetch(`${API_BASE_URL}/devices/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then((response) => response.json());
    } catch (error) {
        console.error('Error updating device:', error);
    }
};

const deleteDevice = async (deviceUid: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceUid}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting device:', error);
        return false;
    }
};

const activateDevice = async (deviceUid: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/activate/${deviceUid}`, {
            method: 'POST',
        });
        return response.ok;
    } catch (error) {
        console.error('Error activating device:', error);
        return false;
    }
};

const clearDeviceData = async (deviceUid: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/clear/${deviceUid}`, {
            method: 'POST',
        });
        return response.ok;
    } catch (error) {
        console.error('Error clearing device data:', error);
        return false;
    }
};

export { getDevices, getDevice, getLatestReadingsForDeviceUid, postDeviceChanges, deleteDevice, activateDevice, clearDeviceData };
