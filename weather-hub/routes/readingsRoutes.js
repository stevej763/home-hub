const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/temperature', (req, res) => {
    db.query('SELECT reading, device_name, t.device_uid, reading_time, temperature_uid FROM temperature t LEFT JOIN device d ON d.device_uid = t.device_uid ORDER BY t.reading_time DESC LIMIT 1000', (error, results) => {
        res.json(results.rows);
    });
});

const caluculateTruncation = (from, to) => {
    const date1 = new Date(from);
    const date2 = new Date(to);
    const diffInMs = Math.abs(date2 - date1);
    const diffInDays = Math.ceil(diffInMs / 1000 / 60 / 60 / 24);
    if (diffInDays >= 90) {
        return 'month'
    }
    if (diffInDays >= 30) {
        return 'day'
    }
    if (diffInDays >= 7) {
        return 'day'
    } 
    if (diffInDays >= 1) {
        return 'hour'
    } else {
        return 'minute'
    }

}

router.get('/temperature/interval', (req, res) => {
    const [from, to] = [req.query.from, req.query.to]
    const truncation = caluculateTruncation(from, to)
    db.query(`
    WITH intervals AS (
        SELECT generate_series(
            date_trunc($3, MIN($1)::TIMESTAMP),
            date_trunc($3, MAX($2)::TIMESTAMP),
            interval '1 ${truncation}'
        ) AS timestamp
        FROM temperature t
    ),
    device_intervals AS (
        SELECT i.timestamp, d.device_uid, d.device_name
        FROM intervals i
        CROSS JOIN device d
    )
    SELECT
        di.timestamp,
        di.device_uid,
        di.device_name,
        COALESCE(ROUND(AVG(t.reading)::numeric, 2), 0) AS average_reading
    FROM
        device_intervals di
    LEFT JOIN temperature t ON date_trunc($3, t.reading_time) = di.timestamp AND t.device_uid = di.device_uid
    GROUP BY di.timestamp, di.device_uid, di.device_name
    ORDER BY di.timestamp DESC;
    `, [from, to, truncation], (error, results) => {
        if (error) {
            console.log(error);
            return;
        }
        res.json(results.rows);
    });
});

router.get('/pressure/interval', (req, res) => {
    const [from, to] = [req.query.from, req.query.to]
    const truncation = caluculateTruncation(from, to);
    db.query(`
    WITH intervals AS (
        SELECT generate_series(
            date_trunc($3, MIN($1)::TIMESTAMP),
            date_trunc($3, MAX($2)::TIMESTAMP),
            interval '1 ${truncation}'
        ) AS timestamp
        FROM pressure p
    ),
    device_intervals AS (
        SELECT i.timestamp, d.device_uid, d.device_name
        FROM intervals i
        CROSS JOIN device d
    )
    SELECT
        di.timestamp,
        di.device_uid,
        di.device_name,
        COALESCE(ROUND(AVG(p.reading)::numeric, 2), 0) AS average_reading
    FROM
        device_intervals di
    LEFT JOIN pressure p ON date_trunc($3, p.reading_time) = di.timestamp AND p.device_uid = di.device_uid
    GROUP BY di.timestamp, di.device_uid, di.device_name
    ORDER BY di.timestamp DESC;
    `, [from, to, truncation], (error, results) => {
        res.json(results.rows);
    });
});

router.get('/humidity/interval', (req, res) => {
    const [from, to] = [req.query.from, req.query.to]
    const truncation = caluculateTruncation(from, to);
    db.query(`
    WITH intervals AS (
        SELECT generate_series(
            date_trunc($3, MIN($1)::TIMESTAMP),
            date_trunc($3, MAX($2)::TIMESTAMP),
            interval '1 ${truncation}'
        ) AS timestamp
        FROM humidity h
    ),
    device_intervals AS (
        SELECT i.timestamp, d.device_uid, d.device_name
        FROM intervals i
        CROSS JOIN device d
    )
    SELECT
        di.timestamp,
        di.device_uid,
        di.device_name,
        COALESCE(ROUND(AVG(h.reading)::numeric, 2), 0) AS average_reading
    FROM
        device_intervals di
    LEFT JOIN humidity h ON date_trunc($3, h.reading_time) = di.timestamp AND h.device_uid = di.device_uid
    GROUP BY di.timestamp, di.device_uid, di.device_name
    ORDER BY di.timestamp DESC;
    `, [from, to, truncation], (error, results) => {
        if (error) {
            console.log(error);
            return;
        }
        res.json(results.rows);
    });
});

router.get('/latest', (req, res) => {
    db.query(`
    SELECT d.device_name, d.device_uid, 
            (SELECT reading FROM temperature WHERE device_uid = d.device_uid ORDER BY id DESC LIMIT 1) AS temperature,
            (SELECT reading FROM humidity WHERE device_uid = d.device_uid ORDER BY id DESC LIMIT 1) AS humidity,
            (SELECT reading FROM pressure WHERE device_uid = d.device_uid ORDER BY id DESC LIMIT 1) AS pressure
        FROM device d
    `, (error, results) => {
        res.json(results.rows);
    });
});

router.get('/latest/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query(`
    WITH latest_temperature AS (
        SELECT reading, reading_time, device_uid 
        FROM temperature 
        WHERE device_uid = $1 
        ORDER BY reading_time DESC 
        LIMIT 1
    ),
    latest_humidity AS (
        SELECT reading, reading_time, device_uid
        FROM humidity 
        WHERE device_uid = $1 
        ORDER BY id DESC 
        LIMIT 1
    ),
    latest_pressure AS (
        SELECT reading, reading_time, device_uid
        FROM pressure 
        WHERE device_uid = $1 
        ORDER BY id DESC 
        LIMIT 1
    )
    SELECT 
        d.device_name, 
        d.device_uid, 
        lt.reading AS temperature, 
        lt.reading_time AS temperature_timestamp,
        lh.reading AS humidity, 
        lh.reading_time AS humidity_timestamp,
        lp.reading AS pressure, 
        lp.reading_time AS pressure_timestamp
    FROM device d
    LEFT JOIN latest_temperature lt ON lt.device_uid = d.device_uid
    LEFT JOIN latest_humidity lh ON lh.device_uid = d.device_uid
    LEFT JOIN latest_pressure lp ON lp.device_uid = d.device_uid
    WHERE d.device_uid = $1
    `, [deviceUid], (error, results) => {
        if (error) {
            console.log(error);
            return;
        }
        res.json(results.rows[0]);
    });
});



router.get('/temperature/latest/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query('SELECT reading, device_name, t.device_uid, reading_time, temperature_uid FROM temperature t LEFT JOIN device d ON d.device_uid = t.device_uid WHERE t.device_uid = $1 ORDER BY t.reading_time DESC LIMIT 1', [deviceUid], (error, results) => {
        res.json(results.rows[0]);
    });
});

router.get('/humidity/latest/:deviceUid', (req, res) => { 
    const deviceUid = req.params.deviceUid;
    db.query('SELECT reading, device_name, t.device_uid, reading_time, humidity_uid FROM humidity t LEFT JOIN device d ON d.device_uid = t.device_uid WHERE t.device_uid = $1 ORDER BY t.reading_time DESC LIMIT 1', [deviceUid], (error, results) => {
        res.json(results.rows);
    });
});

router.get('/pressure/latest/:deviceUid', (req, res) => {
    const deviceUid = req.params.deviceUid;
    db.query('SELECT reading, device_name, t.device_uid, reading_time, pressure_uid FROM pressure t LEFT JOIN device d ON d.device_uid = t.device_uid WHERE t.device_uid = $1 ORDER BY t.reading_time DESC LIMIT 1', [deviceUid], (error, results) => {
        res.json(results.rows);
    });
});

router.get('/temperature/:device_uid', (req, res) => {
    const device_uid = req.params.device_uid;
    db.query('SELECT * FROM temperature WHERE device_uid = $1', [device_uid], (error, results) => {
        res.json(results.rows);
    });
});

router.get('/humidity', (req, res) => {
    db.query('SELECT reading, device_name, h.device_uid, reading_time, humidity_uid FROM humidity h LEFT JOIN device d ON d.device_uid = h.device_uid ORDER BY h.reading_time DESC LIMIT 1000', (error, results) => {
        res.json(results.rows);
    });
});

router.get('/humidity/:device_uid', (req, res) => {
    const device_uid = req.params.device_uid;
    db.query('SELECT * FROM humidity WHERE device_uid = $1', [device_uid], (error, results) => {
        res.json(results.rows);
    });
});

router.get('/pressure', (req, res) => {
    db.query('SELECT reading, device_name, p.device_uid, reading_time, pressure_uid FROM pressure p LEFT JOIN device d ON d.device_uid = p.device_uid ORDER BY p.reading_time DESC LIMIT 1000', (error, results) => {
        res.json(results.rows);
    });
});

router.get('/pressure/:device_uid', (req, res) => {
    const device_uid = req.params.device_uid;
    db.query('SELECT * FROM pressure WHERE device_uid = $1', [device_uid], (error, results) => {
        res.json(results.rows);
    });
});

module.exports = router;