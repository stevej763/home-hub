const { validate: isUuid } = require('uuid');

// Validates a UUID coming from req.params or req.body before it reaches a
// query - otherwise an invalid value surfaces as a raw Postgres "invalid
// input syntax for type uuid" error and a 500 instead of a clean 400.
const validateUuid = (fieldName, { location = 'params', optional = false } = {}) => (req, res, next) => {
    const value = req[location]?.[fieldName];
    if (optional && (value === null || value === undefined)) {
        next();
        return;
    }
    if (!isUuid(value)) {
        res.status(400).json({ error: `${fieldName} must be a valid UUID` });
        return;
    }
    next();
};

module.exports = validateUuid;
