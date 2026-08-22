const db = require('./db');
const logger = require('./logger');

const markDeviceAsOffline = async () => {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - 1);
    try {
        const results = await db.query('UPDATE device SET status = $1 WHERE status = $2 AND last_active_at < $3::TIMESTAMPTZ', ["OFFLINE", "ACTIVE", timestamp]);
        if (results.rowCount > 0) {
            logger.info('Marked devices as OFFLINE', { count: results.rowCount });
        }
    } catch (error) {
        logger.error('Failed to mark devices as OFFLINE', { error: error.message });
    }
}

const markReadyDevicesAsActive = async () => {
    try {
        const results = await db.query('UPDATE device SET status = $1 WHERE status = $2', ["ACTIVE", "READY"]);
        if (results.rowCount > 0) {
            logger.info('Marked devices as ACTIVE', { count: results.rowCount });
        }
    } catch (error) {
        logger.error('Failed to mark devices as ACTIVE', { error: error.message });
    }
}

const addLatestDeviceActivity = async (deviceUid) => {
    const timestamp = new Date();
    try {
        await db.query('UPDATE device SET last_active_at = $1 WHERE device_uid = $2', [timestamp, deviceUid]);
    } catch (error) {
        logger.error('Failed to record device activity', { deviceUid, error: error.message });
    }
}

module.exports = {markDeviceAsOffline, addLatestDeviceActivity, markReadyDevicesAsActive};
