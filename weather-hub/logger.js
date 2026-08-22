const LEVELS = ['error', 'warn', 'info', 'debug'];
const CONSOLE_METHOD = { error: 'error', warn: 'warn', info: 'log', debug: 'log' };

const configuredLevel = LEVELS.includes(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'info';
const threshold = LEVELS.indexOf(configuredLevel);

const formatMeta = (meta) => {
    if (!meta || Object.keys(meta).length === 0) return '';
    return ' ' + Object.entries(meta)
        .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join(' ');
};

const log = (level, message, meta) => {
    if (LEVELS.indexOf(level) > threshold) return;
    const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}${formatMeta(meta)}`;
    console[CONSOLE_METHOD[level]](line);
};

module.exports = {
    error: (message, meta) => log('error', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    info: (message, meta) => log('info', message, meta),
    debug: (message, meta) => log('debug', message, meta),
};
