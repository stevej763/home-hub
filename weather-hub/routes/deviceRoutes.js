const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');
const logger = require('../logger');

const DEVICE_STATUS = [
    "REGISTERED",
    "CALIBRATING",
    "READY",
    "ACTIVE",
    "DISABLED",
    "OFFLINE",
    "RETIRED"
]

router.get('/', asyncHandler(async (req, res) => {
    const results = await db.query('SELECT * FROM device LEFT JOIN location ON device.location_uid = location.location_uid');
    res.json(results.rows);
}));

router.get('/t', asyncHandler(async (req, res) => {
    const results = await db.query(`SELECT * FROM device`);
    res.json(results.rows);
}));

router.get('/status/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    const results = await db.query('SELECT status FROM device WHERE device_uid = $1', [deviceUid]);
    res.json(results.rows[0]);
}));

router.get('/:id', validateUuid('id'), asyncHandler(async (req, res) => {
    const id = req.params.id;
    const results = await db.query('SELECT * FROM device WHERE device_uid = $1', [id]);
    res.json(results.rows[0]);
}));

router.post('/status/calibrating/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["CALIBRATING", deviceUid]);
    logger.info('Device status updated', { deviceUid, status: 'CALIBRATING' });
    res.json({"result": "success", "device_id": deviceUid, "message": "Device status set to CALIBRATING"});
}));

router.post('/status/ready/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["READY", deviceUid]);
    logger.info('Device status updated', { deviceUid, status: 'READY' });
    res.json({"result": "success", "device_id": deviceUid, "message": "Device status set to READY"});
}));


router.post('/register', validateUuid('device_uid', { location: 'body' }), asyncHandler(async (req, res) => {
    const { device_uid, device_name, ip_address } = req.body;
    const software_version = req.body.software_version ?? null;
    const mac_address = req.body.mac_address ?? null;
    const hostname = req.body.hostname ?? null;

    const existing = await db.query('SELECT * FROM device WHERE device_uid = $1', [device_uid]);
    if (existing.rows.length > 0) {
        await db.query('UPDATE device SET status = $1, software_version = $2, mac_address = $3, hostname = $4 WHERE device_uid = $5',
            ["REGISTERED", software_version, mac_address, hostname, device_uid]);
        logger.info('Device re-registered', { deviceUid: device_uid, status: 'REGISTERED' });
        res.json({"result": "success", "device_id": device_uid, "message": "Device already exists. Device status set to REGISTERED"});
        return;
    }

    const timestamp = new Date();
    await db.query('INSERT INTO device (device_uid, device_name, ip_address, status, created_at, updated_at, software_version, mac_address, hostname) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [device_uid, device_name, ip_address, "REGISTERED", timestamp, timestamp, software_version, mac_address, hostname]);
    logger.info('Device registered', { deviceUid: device_uid, deviceName: device_name, ipAddress: ip_address });
    res.json({"result": "success", "device_uid": device_uid});
}));

router.post('/update',
    validateUuid('deviceUid', { location: 'body' }),
    validateUuid('locationUid', { location: 'body', optional: true }),
    asyncHandler(async (req, res) => {
        const { deviceUid, deviceName, locationUid } = req.body;
        const results = await db.query('UPDATE device SET device_name = $1, location_uid = $2 WHERE device_uid = $3', [deviceName, locationUid, deviceUid]);
        logger.info('Device updated', { deviceUid, deviceName, locationUid, rowCount: results.rowCount });
        res.json({"result": "success", "message": "Device details updated successfully"});
    })
);

router.post('/clear/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM temperature WHERE device_uid = $1', [deviceUid]);
        await client.query('DELETE FROM humidity WHERE device_uid = $1', [deviceUid]);
        await client.query('DELETE FROM pressure WHERE device_uid = $1', [deviceUid]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
    logger.info('Device data cleared', { deviceUid });
    res.json({"result": "success", "message": "Device data cleared successfully"});
}));


router.post('/retire/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["RETIRED", deviceUid]);
    logger.info('Device status updated', { deviceUid, status: 'RETIRED' });
    res.json({"result": "success", "device_id": deviceUid});
}));


router.delete('/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    const results = await db.query('DELETE FROM device WHERE device_uid = $1', [deviceUid]);
    logger.info('Device deleted', { deviceUid, rowCount: results.rowCount });
    res.json({"result": "success", "device_id": deviceUid, "message": "Device deleted successfully"});
}));

router.post('/activate/:deviceUid', validateUuid('deviceUid'), asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["ACTIVE", deviceUid]);
    logger.info('Device status updated', { deviceUid, status: 'ACTIVE' });
    res.json({"result": "success", "device_id": deviceUid});
}));

module.exports = router;
