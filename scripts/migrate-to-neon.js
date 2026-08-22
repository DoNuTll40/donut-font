import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { parseFontFileInfo } from '../lib/fontsStorage.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL is not defined in .env file');
  process.exit(1);
}

const sql = neon(connectionString);

async function migrate() {
  console.log('🚀 Connecting to Neon Postgres Database...');
  
  // 1. Create tables
  console.log('📦 Step 1: Initializing database schema (font_files, system_settings)...');
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

  await sql`
    INSERT INTO system_settings (key, value)
    VALUES ('version', 'v1.2.0')
    ON CONFLICT (key) DO NOTHING;
  `;

  console.log('✅ Tables created successfully!');

  // 2. Scan public/fonts/
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  if (!fs.existsSync(fontsDir)) {
    console.log('ℹ️ No public/fonts directory found.');
    return;
  }

  const files = fs.readdirSync(fontsDir);
  const fontFiles = files.filter(f => ['.woff2', '.woff', '.ttf', '.otf'].includes(path.extname(f).toLowerCase()));

  console.log(`📁 Step 2: Found ${fontFiles.length} font files in public/fonts. Uploading to Neon DB...`);

  let successCount = 0;

  for (let i = 0; i < fontFiles.length; i++) {
    const filename = fontFiles[i];
    const fullPath = path.join(fontsDir, filename);
    const buffer = fs.readFileSync(fullPath);
    const info = parseFontFileInfo(filename);

    if (!info) {
      console.warn(`⚠️ Skipping unsupported file: ${filename}`);
      continue;
    }

    const base64Data = buffer.toString('base64');

    await sql`
      INSERT INTO font_files (
        filename, family_id, family_name, weight, is_italic, format, file_data, size_bytes
      )
      VALUES (
        ${filename},
        ${info.familyId},
        ${info.familyName},
        ${info.weight},
        ${info.isItalic},
        ${info.format},
        decode(${base64Data}, 'base64'),
        ${buffer.length}
      )
      ON CONFLICT (filename) DO UPDATE SET
        family_id = EXCLUDED.family_id,
        family_name = EXCLUDED.family_name,
        weight = EXCLUDED.weight,
        is_italic = EXCLUDED.is_italic,
        format = EXCLUDED.format,
        file_data = EXCLUDED.file_data,
        size_bytes = EXCLUDED.size_bytes,
        created_at = CURRENT_TIMESTAMP;
    `;

    successCount++;
    process.stdout.write(`\r progress: [${successCount}/${fontFiles.length}] uploaded: ${filename.padEnd(35)}`);
  }

  console.log('\n\n🎉 Migration complete!');

  // 3. Verify total in DB
  const countRes = await sql`SELECT count(*)::int as total FROM font_files;`;
  const familiesRes = await sql`SELECT DISTINCT family_name, count(*)::int as files_count FROM font_files GROUP BY family_name;`;

  console.log(`📊 Neon Database Verification: Total ${countRes[0].total} files stored.`);
  console.table(familiesRes);
}

migrate().catch(err => {
  console.error('❌ Migration failed with error:', err);
  process.exit(1);
});
