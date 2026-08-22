const logger = require('../logger');

const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        logger[level]('Request handled', {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: durationMs.toFixed(1),
        });
    });
    next();
};

module.exports = requestLogger;
