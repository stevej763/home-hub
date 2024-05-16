const express = require('express');
const router = express.Router();
const db = require('../db');
const uuid = require('uuid');


router.post('/record', (req, res) => {
    const { device_uid, temperature, humidity, pressure } = req.body;
    console.log("data received from: ", device_uid, " temperature: ", temperature, " humidity: ", humidity, " pressure: ", pressure)
    const timestamp = new Date().toISOString();
    db.query('SELECT status FROM device WHERE device_uid = $1', [req.body.device_uid], (error, results) => {
        if (results.rows[0].status != "ACTIVE") {
            res.json({"error": "Device is not active"})
            return;
        } else {
            if (temperature != null) {
                db.query('INSERT INTO temperature (temperature_uid, reading, device_uid, reading_time) VALUES ($1, $2, $3, $4)', 
                [uuid.v4(), temperature, device_uid, timestamp], (error, results) => {
                    if (error) {
                        console.log(error)
                        res.json(error)
                        return;
                    }
                });
            }
            if (humidity != null) {
                db.query('INSERT INTO humidity (humidity_uid, reading, device_uid, reading_time) VALUES ($1, $2, $3, $4)', 
                [uuid.v4(), humidity, device_uid, timestamp], (error, results) => {
                    if (error) {
                        console.log(error)
                        res.json(error)
                        return;
                    } 
                });
            }
            if (pressure != null) {
                db.query('INSERT INTO pressure (pressure_uid, reading, device_uid, reading_time) VALUES ($1, $2, $3, $4)', 
                [uuid.v4(), pressure, device_uid, timestamp], (error, results) => {
                    if (error) {
                        console.log(error)
                        res.json(error)
                        return;
                    } 
                });
            }
            res.json({"result": "success"});
        }
    })
   
});

module.exports = router;