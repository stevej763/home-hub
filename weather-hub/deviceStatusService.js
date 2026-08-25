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

const recordDeviceHeartbeat = async (deviceUid, diagnostics = {}) => {
    const timestamp = new Date();
    const { cpu_temperature = null, uptime_seconds = null, read_error_count = null, wifi_signal_strength = null } = diagnostics;
    try {
        await db.query(
            'UPDATE device SET last_active_at = $1, cpu_temperature = $2, uptime_seconds = $3, read_error_count = $4, wifi_signal_strength = $5 WHERE device_uid = $6',
            [timestamp, cpu_temperature, uptime_seconds, read_error_count, wifi_signal_strength, deviceUid]
        );
    } catch (error) {
        logger.error('Failed to record device activity', { deviceUid, error: error.message });
    }
}

module.exports = {markDeviceAsOffline, recordDeviceHeartbeat, markReadyDevicesAsActive};
