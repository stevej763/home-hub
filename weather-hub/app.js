require('dotenv').config()
const express = require('express');
const cors = require('cors'); 
const {startCronJobs} = require('./cronService.js');
const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // No Origin header (curl, server-to-server requests) - always allow.
        // Empty allowlist (CORS_ALLOWED_ORIGINS unset) - allow everything.
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        console.log(`Blocked CORS request from origin: ${origin}`);
        callback(null, false);
    }
}));
app.use(express.json());

const deviceRouter = require('./routes/deviceRoutes');
const measurementRouter = require('./routes/measurementRoutes');
const readingsRouter = require('./routes/readingsRoutes');
const locationRouter = require('./routes/locationRoutes');

app.use('/devices', deviceRouter);
app.use('/measurement', measurementRouter);
app.use('/readings', readingsRouter);
app.use('/locations', locationRouter)

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

startCronJobs();

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
