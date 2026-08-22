import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load .env in non-Next.js script environments if needed
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function initDatabaseSchema() {
  const sql = getSql();
  if (!sql) {
    console.warn('Neon DB: DATABASE_URL is not set.');
    return false;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS font_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        family_id VARCHAR(100) NOT NULL,
        family_name VARCHAR(100) NOT NULL,
        weight INTEGER NOT NULL,
        is_italic BOOLEAN DEFAULT false,
        format VARCHAR(20) NOT NULL,
        file_data BYTEA NOT NULL,
        size_bytes INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Initialize default version if not present
    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('version', 'v1.2.0')
      ON CONFLICT (key) DO NOTHING;
    `;

    return true;
  } catch (err) {
    console.error('Error initializing Neon DB schema:', err);
    return false;
  }
}
