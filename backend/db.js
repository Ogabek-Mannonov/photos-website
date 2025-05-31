import pkg from 'pg';
const { Pool } = pkg;



const pool = new Pool({
  connectionString: 'postgres://postgres:12345abcd@db-postgres-xyz.render.com:5432/photoWebsite?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
