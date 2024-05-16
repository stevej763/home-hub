const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const deviceRouter = require('./routes/deviceRoutes');
const measurementRouter = require('./routes/measurementRoutes');
const readingsRouter = require('./routes/readingsRoutes');



app.use('/devices', deviceRouter);
app.use('/measurement', measurementRouter);
app.use('/readings', readingsRouter);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
