const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'food_ordering_system',
    password: '',
    port: 5432,
});

module.exports = pool;
