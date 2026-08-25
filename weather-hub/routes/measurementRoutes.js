const express = require('express');
const router = express.Router();
const db = require('../db');
const uuid = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');
const { recordDeviceHeartbeat } = require('../deviceStatusService');


router.post('/record', validateUuid('device_uid', { location: 'body' }), asyncHandler(async (req, res) => {
    const { device_uid, temperature, humidity, pressure, cpu_temperature, uptime_seconds, read_error_count, wifi_signal_strength } = req.body;
    const timestamp = new Date();

    const device = await db.query('SELECT status FROM device WHERE device_uid = $1', [device_uid]);
    if (device.rows.length === 0 || device.rows[0].status !== "ACTIVE") {
        res.json({"error": "Device is not active"});
        return;
    }

    await recordDeviceHeartbeat(device_uid, { cpu_temperature, uptime_seconds, read_error_count, wifi_signal_strength });

    const inserts = [];
    if (temperature != null) {
        inserts.push(db.query('INSERT INTO temperature (temperature_uid, reading, device_uid, reading_time) VALUES ($1, $2, $3, $4)',
            [uuid.v4(), temperature, device_uid, timestamp]));
    }
    if (humidity != null) {
        inserts.push(db.query('INSERT INTO humidity (humidity_uid, reading, device_uid, reading_time) VALUES ($1, $2, $3, $4)',
            [uuid.v4(), humidity, device_uid, timestamp]));
    }
    if (pressure != null) {
        inserts.push(db.query('INSERT INTO pressure (pressure_uid, reading, device_uid, reading_time) VALUES ($1, $2, $3, $4)',
            [uuid.v4(), pressure, device_uid, timestamp]));
    }

    await Promise.all(inserts);
    res.json({"result": "success"});
}));

module.exports = router;
