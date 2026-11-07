const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize PostgreSQL Pool
const isProductionOrNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionOrNeon || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'))
    ? { rejectUnauthorized: false }
    : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Helper for running parameterized SQL queries
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Executed query:', { text, duration, rows: res.rowCount });
  return res;
}

// Automatically initialize tables from schema.sql
async function initDb() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✅ PostgreSQL Database tables verified / initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  initDb
};
