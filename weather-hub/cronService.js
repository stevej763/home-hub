const cron = require('node-cron');
const {markDeviceAsOffline, markReadyDevicesAsActive} = require('./deviceStatusService');


const startCronJobs = () => {
    perMinuteJobs()
}


const perMinuteJobs = () => {
    cron.schedule('1 * * * * *', () => {
        markDeviceAsOffline()
        markReadyDevicesAsActive()
    });
}

module.exports = {startCronJobs}