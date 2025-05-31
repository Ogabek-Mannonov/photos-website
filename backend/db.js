const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://image_web:uUttgnhNQFa3lZ0IOVYrRx7EFrf2rpUP@dpg-d0tcrqc9c44c739blhfg-a.oregon-postgres.render.com/image_web',
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
