const { Pool, types } = require('pg');
var pgtypes = types;
pgtypes.setTypeParser(1114, function(stringValue) {
return stringValue;
});
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'weatherhub',
    password: 'password',
    port: 5432
});

module.exports = pool;