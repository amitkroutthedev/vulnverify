import { Pool } from 'pg';

// Use DATABASE_URL if provided, otherwise use individual connection parameters
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cvechat',
      user: process.env.DB_USER || 'cvechat',
      password: process.env.DB_PASSWORD || 'your_password_here',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    console.error('Database connection error. Make sure your environment variables are set correctly.');
    console.error('Required: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    console.error('Or use: DATABASE_URL');
  }
});

export { pool };