const { Pool } = require('pg');
const logger = require('./logger');

logger.info('Connecting to database', {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
});

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});

pool.on('error', (error) => {
    logger.error('Unexpected database pool error', { error: error.message });
});

module.exports = pool;