const { Pool, types } = require('pg');
const pgtypes = types;
pgtypes.setTypeParser(1114, function(stringValue) {
return stringValue;
});

console.log("db user:", process.env.DATABASE_USER)
console.log("db host:", process.env.DATABASE_HOST)
console.log("db db:", process.env.DATABASE_NAME)
console.log("db password:", process.env.DATABASE_PASSWORD)
console.log("db port:", process.env.DATABASE_PORT)

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});
module.exports = pool;