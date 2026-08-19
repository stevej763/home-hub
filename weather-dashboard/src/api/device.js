const apiServer = process.env.REACT_APP_API_SERVER;
const port = process.env.REACT_APP_API_PORT;

const getDevices = async () => {
    try {
        return await fetch(`http://${apiServer}:${port}/devices`).then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return []
    }
}

const getDevice = async (deviceUid) => {
    try {
        return await fetch(`http://${apiServer}:${port}/devices/${deviceUid}`).then((response) => response.json());
    } catch (error) {
        console.error('Error fetching device summary:', error);
        return {}
    }
}

const getLatestReadingsForDeviceUid = async (deviceUid) => {
    try {
        return await fetch(`http://${apiServer}:${port}/readings/latest/${deviceUid}`).then((response) => response.json());
    } catch (error) {
        console.error('Error fetching latest readings:', error);
        return {}
    }
}

const postDeviceChanges = async (payload) => {
    try {
        return await fetch(`http://${apiServer}:${port}/devices/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then((response) => response.json());
    } catch (error) {
        console.error('Error updating device:', error);
    }
}

const deleteDevice = async (deviceUid) => {
    try {
        const response = await fetch(`http://${apiServer}:${port}/devices/${deviceUid}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting device:', error);
        return false;
    }
}

const activateDevice = async (deviceUid) => {
    try {
        const response = await fetch(`http://${apiServer}:${port}/devices/activate/${deviceUid}`, {
            method: 'POST',
        });
        return response.ok;
    } catch (error) {
        console.error('Error activating device:', error);
        return false;
    }
}

const clearDeviceData = async (deviceUid) => {
    try {
        const response = await fetch(`http://${apiServer}:${port}/devices/clear/${deviceUid}`, {
            method: 'POST',
        });
        return response.ok;
    } catch (error) {
        console.error('Error clearing device data:', error);
        return false;
    }
}

export { getDevices, getDevice, getLatestReadingsForDeviceUid, postDeviceChanges, deleteDevice, activateDevice, clearDeviceData };