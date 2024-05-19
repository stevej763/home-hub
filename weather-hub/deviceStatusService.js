const db = require('./db');

const markDeviceAsOffline = () => {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - 1);
    db.query('UPDATE device SET status = $1 WHERE status = $2 AND last_active_at < $3::TIMESTAMP', ["OFFLINE", "ACTIVE", timestamp], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(`Marked ${results.rowCount} devices as OFFLINE`)
        }
    });
}

const addLatestDeviceActivity = async (deviceUid) => {
    const timestamp = new Date();
    db.query('UPDATE device SET last_active_at = $1 WHERE device_uid = $2', [timestamp, deviceUid], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(`Updated last active time for device ${deviceUid} to ${timestamp}`)
        }
    });
}

module.exports = {markDeviceAsOffline, addLatestDeviceActivity};