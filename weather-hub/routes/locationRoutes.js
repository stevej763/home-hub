const express = require('express');
const router = express.Router();
const db = require('../db');
const uuid = require('uuid');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
    const results = await db.query('SELECT * FROM location');
    res.json(results.rows);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const { name } = req.body;
    console.log("adding location: ", name)
    const createdAt = new Date();
    await db.query('INSERT INTO location (location_uid, location_name, created_at, updated_at) VALUES ($1, $2, $3, $3)',
        [uuid.v4(), name, createdAt]);
    res.json({"result": "success"});
}));

module.exports = router;
