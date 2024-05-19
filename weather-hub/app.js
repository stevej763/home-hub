const express = require('express');
const cors = require('cors'); 
const cron = require('node-cron');
const app = express();
const port = 3001;
const {markDeviceAsOffline} = require('./deviceStatusService');

app.use(cors());
app.use(express.json());

const deviceRouter = require('./routes/deviceRoutes');
const measurementRouter = require('./routes/measurementRoutes');
const readingsRouter = require('./routes/readingsRoutes');

app.use('/devices', deviceRouter);
app.use('/measurement', measurementRouter);
app.use('/readings', readingsRouter);

cron.schedule('1 * * * * *', () => {
    console.log('Marking devices with last reading longer than a minute ago as OFFLINE')
    markDeviceAsOffline()
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
