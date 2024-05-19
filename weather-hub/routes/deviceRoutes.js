const express = require('express');
const router = express.Router();
const db = require('../db');

const DEVICE_STATUS = [
    "REGISTERED",
    "CALIBRATING",
    "READY",
    "ACTIVE",
    "DISABLED",
    "OFFLINE",
    "RETIRED"
]

router.get('/', (req, res) => {
    console.log("Getting all devices")
    db.query('SELECT * FROM device', (error, results) => {
        res.json(results.rows);
    });
});

router.get('/status/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query('SELECT status FROM device WHERE device_uid = $1', [deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        }
        res.json(results.rows[0]);
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM device WHERE device_uid = $1', [id], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        }
        res.json(results.rows[0]);
    });
});

router.post('/status/calibrating/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["CALIBRATING", deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        } else {
            console.log(`Marking device ${deviceUid} as CALIBRATING`)
            res.json({"result": "success", "device_id": deviceUid, "message": "Device status set to CALIBRATING"});
        }
    });
});

router.post('/status/ready/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["READY", deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        } else {
            console.log(`Marking device ${deviceUid} as READY`)
            res.json({"result": "success", "device_id": deviceUid, "message": "Device status set to READY"});
        }
    });
});


router.post('/register', (req, res) => {
    const { device_uid, device_name, ip_address } = req.body;
    console.log(device_uid, device_name, ip_address)
    db.query('SELECT * FROM device WHERE device_uid = $1', [device_uid], (error, results) => {
        if (error) {
            console.log(error)
            res.json(error)
            return;
        }
        if (results.rows.length > 0) {
            db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["REGISTERED", device_uid], (error, statusUpdate) => {
                if (error) {
                    console.log(error);
                    res.json(error);
                    return;
                } else {
                    console.log(`Marking device ${device_uid} as REGISTERED`)
                    res.json({"result": "success", "device_id": device_uid, "message": "Device already exists. Device status set to REGISTERED"});
                }
            });
        } else {
                    const timestamp = new Date().toISOString();
            db.query('INSERT INTO device (device_uid, device_name, ip_address, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)', 
            [device_uid, device_name, ip_address, "REGISTERED", timestamp, timestamp], (error, results) => {
                if (error) {
                    console.log(error)
                    res.json(error)
                    return;
                } else {
                    console.log(`"Successfully registered device device_uid: ", device_uid`)
                    res.json({"result": "success", "device_uid": device_uid});    
                }
            });
        }
    })
});

router.post('/clear/:deviceUid', (req, res) => {
    console.log("Clearing device: ", req.params.deviceUid)
    const deviceUid = req.params.deviceUid;
    db.query('DELETE FROM temperature WHERE device_uid = $1', [deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        }
    });
    db.query('DELETE FROM humidity WHERE device_uid = $1', [deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        }
    });
    db.query('DELETE FROM pressure WHERE device_uid = $1', [deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        }
    });
    res.json({"result": "success", "message": "Device data cleared successfully"});
});


router.post('/retire/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    console.log(deviceUid)
    db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["RETIRED", deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        } else {
            console.log(results);
            res.json({"result": "success", "device_id": deviceUid});
        }
    });
});


router.delete('/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query('DELETE FROM device WHERE device_uid = $1', [deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        } else {
            console.log(results);
            res.json({"result": "success", "device_id": deviceUid, "message": "Device deleted successfully"});
        }
    });
})

router.post('/activate/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    console.log(deviceUid)
    db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["ACTIVE", deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        } else {
            console.log(`Marking device ${deviceUid} as ACTIVE`)
            res.json({"result": "success", "device_id": deviceUid});
        }
    });
});

router.post('/status/calibrating/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    console.log(deviceUid)
    db.query('UPDATE device SET status = $1 WHERE device_uid = $2', ["CALIBRATING", deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            res.json(error);
            return;
        } else {
            console.log(results);
            res.json({"result": "success", "device_id": deviceUid});
        }
    });
});



module.exports = router;