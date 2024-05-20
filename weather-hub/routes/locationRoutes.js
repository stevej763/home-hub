const express = require('express');
const router = express.Router();
const db = require('../db');
const uuid = require('uuid');

router.get('/', (req, res) => {
    db.query('SELECT * FROM location', (error, results) => {
        res.json(results.rows);
    });
});

router.post('/add', (req, res) => {
    const { name } = req.body;
    console.log("adding location: ", name)
    const createdAt = new Date();
    db.query('INSERT INTO location (location_uid, location_name, created_at, updated_at) VALUES ($1, $2, $3, $3)', 
    [uuid.v4(), name, createdAt], (error, results) => {
        if (error) {
            console.log(error)
            res.json(error)
            return;
        }
        res.json({"result": "success"});
    });
})

module.exports = router;