const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

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
    console.log("Getting all devices")
    const results = await db.query('SELECT * FROM device LEFT JOIN location ON device.location_uid = location.location_uid');
    res.json(results.rows);
}));

router.get('/t', asyncHandler(async (req, res) => {
    console.log("Getting all devices")
    const results = await db.query(`SELECT * FROM device`);
    res.json(results.rows);
}));

router.get('/status/:deviceUid', asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    const results = await db.query('SELECT status FROM device WHERE device_uid = $1', [deviceUid]);
    res.json(results.rows[0]);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const results = await db.query('SELECT * FROM device WHERE device_uid = $1', [id]);
    res.json(results.rows[0]);
}));

router.post('/status/calibrating/:deviceUid', asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["CALIBRATING", deviceUid]);
    console.log(`Marking device ${deviceUid} as CALIBRATING`)
    res.json({"result": "success", "device_id": deviceUid, "message": "Device status set to CALIBRATING"});
}));

router.post('/status/ready/:deviceUid', asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["READY", deviceUid]);
    console.log(`Marking device ${deviceUid} as READY`)
    res.json({"result": "success", "device_id": deviceUid, "message": "Device status set to READY"});
}));


router.post('/register', asyncHandler(async (req, res) => {
    const { device_uid, device_name, ip_address } = req.body;
    console.log(device_uid, device_name, ip_address)

    const existing = await db.query('SELECT * FROM device WHERE device_uid = $1', [device_uid]);
    if (existing.rows.length > 0) {
        await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["REGISTERED", device_uid]);
        console.log(`Marking device ${device_uid} as REGISTERED`)
        res.json({"result": "success", "device_id": device_uid, "message": "Device already exists. Device status set to REGISTERED"});
        return;
    }

    const timestamp = new Date();
    await db.query('INSERT INTO device (device_uid, device_name, ip_address, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [device_uid, device_name, ip_address, "REGISTERED", timestamp, timestamp]);
    console.log("Successfully registered device device_uid: ", device_uid)
    res.json({"result": "success", "device_uid": device_uid});
}));

router.post('/update', asyncHandler(async (req, res) => {
    const { deviceUid, deviceName, locationUid } = req.body;
    console.log(deviceName, deviceUid, locationUid)
    const results = await db.query('UPDATE device SET device_name = $1, location_uid = $2 WHERE device_uid = $3', [deviceName, locationUid, deviceUid]);
    console.log(results)
    res.json({"result": "success", "message": "Device details updated successfully"});
}));

router.post('/clear/:deviceUid', asyncHandler(async (req, res) => {
    console.log("Clearing device: ", req.params.deviceUid)
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
    res.json({"result": "success", "message": "Device data cleared successfully"});
}));


router.post('/retire/:deviceUid', asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    console.log(deviceUid)
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["RETIRED", deviceUid]);
    res.json({"result": "success", "device_id": deviceUid});
}));


router.delete('/:deviceUid', asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    const results = await db.query('DELETE FROM device WHERE device_uid = $1', [deviceUid]);
    console.log(results)
    res.json({"result": "success", "device_id": deviceUid, "message": "Device deleted successfully"});
}));

router.post('/activate/:deviceUid', asyncHandler(async (req, res) => {
    const deviceUid = req.params.deviceUid;
    console.log(deviceUid)
    await db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["ACTIVE", deviceUid]);
    console.log(`Marking device ${deviceUid} as ACTIVE`)
    res.json({"result": "success", "device_id": deviceUid});
}));

module.exports = router;
