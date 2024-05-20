const express = require('express');
const cors = require('cors'); 
const {startCronJobs} = require('./cronService.js');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const deviceRouter = require('./routes/deviceRoutes');
const measurementRouter = require('./routes/measurementRoutes');
const readingsRouter = require('./routes/readingsRoutes');
const locationRouter = require('./routes/locationRoutes');

app.use('/devices', deviceRouter);
app.use('/measurement', measurementRouter);
app.use('/readings', readingsRouter);
app.use('/locations', locationRouter)

startCronJobs();

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
