const db = require('./db');

const markDeviceAsOffline = async () => {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - 1);
    try {
        await db.query('UPDATE device SET status = $1 WHERE status = $2 AND last_active_at < $3::TIMESTAMP', ["OFFLINE", "ACTIVE", timestamp]);
    } catch (error) {
        console.log("Failed updating to offline")
        console.log(error);
    }
}

const markReadyDevicesAsActive = async () => {
    try {
        const results = await db.query('UPDATE device SET status = $1 WHERE status = $2', ["ACTIVE", "READY"]);
        console.log(`Marked ${results.rowCount} devices as ACTIVE`)
    } catch (error) {
        console.log("Failed updating to active")
        console.log(error);
    }
}

const addLatestDeviceActivity = async (deviceUid) => {
    const timestamp = new Date();
    try {
        await db.query('UPDATE device SET last_active_at = $1 WHERE device_uid = $2', [timestamp, deviceUid]);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {markDeviceAsOffline, addLatestDeviceActivity, markReadyDevicesAsActive};
