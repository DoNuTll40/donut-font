import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSql } from './db.js';

export function getFontsDirs() {
  const publicDir = path.join(process.cwd(), 'public', 'fonts');
  const tmpDir = path.join(os.tmpdir(), 'fonts');

  if (!fs.existsSync(tmpDir)) {
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch (e) {
      console.error('Error creating tmp fonts directory:', e);
    }
  }

  return { publicDir, tmpDir };
}

// 1. Get all font files metadata (Neon DB First with Local Fallback)
export async function getAllFontFiles() {
  const sql = getSql();

  if (sql) {
    try {
      const rows = await sql`
        SELECT filename, family_id, family_name, weight, is_italic, format, size_bytes, created_at
        FROM font_files
        ORDER BY family_name ASC, weight ASC;
      `;
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          filename: r.filename,
          size: r.size_bytes,
          familyId: r.family_id,
          familyName: r.family_name,
          weight: r.weight,
          isItalic: r.is_italic,
          format: r.format,
          isDb: true,
        }));
      }
    } catch (err) {
      console.warn('Neon DB query error, falling back to local files:', err.message);
    }
  }

  // Fallback to local files
  const { publicDir, tmpDir } = getFontsDirs();
  const fileMap = new Map();

  try {
    if (fs.existsSync(publicDir)) {
      const pFiles = fs.readdirSync(publicDir);
      pFiles.forEach(file => {
        const fullPath = path.join(publicDir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
          fileMap.set(file, { filename: file, fullPath, isTmp: false, size: stats.size });
        }
      });
    }
  } catch (e) {}

  try {
    if (fs.existsSync(tmpDir)) {
      const tFiles = fs.readdirSync(tmpDir);
      tFiles.forEach(file => {
        const fullPath = path.join(tmpDir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
          fileMap.set(file, { filename: file, fullPath, isTmp: true, size: stats.size });
        }
      });
    }
  } catch (e) {}

  return Array.from(fileMap.values());
}

// 2. Get specific font binary buffer (Neon DB First with Local Fallback)
export async function getFontFileBuffer(filename) {
  const sql = getSql();

  if (sql) {
    try {
      const rows = await sql`
        SELECT filename, format, encode(file_data, 'base64') as file_base64, size_bytes
        FROM font_files
        WHERE filename = ${filename}
        LIMIT 1;
      `;

      if (rows && rows.length > 0) {
        return {
          filename: rows[0].filename,
          format: rows[0].format,
          size: rows[0].size_bytes,
          buffer: Buffer.from(rows[0].file_base64, 'base64'),
        };
      }
    } catch (err) {
      console.warn(`Neon DB fetch failed for ${filename}, checking local storage:`, err.message);
    }
  }

  // Fallback: Check local filesystem
  const { publicDir, tmpDir } = getFontsDirs();
  const pubPath = path.join(publicDir, filename);
  const tmpPath = path.join(tmpDir, filename);

  let targetPath = null;
  if (fs.existsSync(pubPath)) targetPath = pubPath;
  else if (fs.existsSync(tmpPath)) targetPath = tmpPath;

  if (targetPath) {
    const buffer = fs.readFileSync(targetPath);
    const ext = path.extname(filename).toLowerCase();
    const format = ext === '.woff2' ? 'woff2' : ext === '.woff' ? 'woff' : ext === '.otf' ? 'opentype' : 'truetype';
    return {
      filename,
      format,
      size: buffer.length,
      buffer,
    };
  }

  return null;
}

// 2.1 Batch Get Font Files for Instant ZIP Packaging
export async function getBatchFontFiles(filenames) {
  if (!filenames || filenames.length === 0) return [];
  const sql = getSql();

  if (sql) {
    try {
      const rows = await sql`
        SELECT filename, format, encode(file_data, 'base64') as file_base64, size_bytes
        FROM font_files
        WHERE filename = ANY(${filenames});
      `;

      if (rows && rows.length > 0) {
        return rows.map(r => ({
          filename: r.filename,
          format: r.format,
          size: r.size_bytes,
          buffer: Buffer.from(r.file_base64, 'base64'),
        }));
      }
    } catch (err) {
      console.warn('Neon DB batch fetch fallback:', err.message);
    }
  }

  const results = await Promise.all(filenames.map(f => getFontFileBuffer(f)));
  return results.filter(Boolean);
}

// 3. Write/Upload Font File to Neon DB and Local Storage
export async function writeFontFile(filename, buffer) {
  const sql = getSql();
  const info = parseFontFileInfo(filename);

  if (sql && info) {
    try {
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
    } catch (err) {
      console.error('Error saving to Neon DB:', err);
    }
  }

  // Also write to local filesystem if possible
  const { publicDir, tmpDir } = getFontsDirs();
  try {
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const publicPath = path.join(publicDir, filename);
    fs.writeFileSync(publicPath, buffer);
    return publicPath;
  } catch (err) {
    const tmpPath = path.join(tmpDir, filename);
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
  }
}

// 4. Delete Single Font File from Neon DB & Local Storage
export async function deleteFontFile(filename) {
  let deleted = false;
  const sql = getSql();

  if (sql) {
    try {
      const res = await sql`DELETE FROM font_files WHERE filename = ${filename};`;
      deleted = true;
    } catch (err) {
      console.error('Error deleting from Neon DB:', err);
    }
  }

  const { publicDir, tmpDir } = getFontsDirs();
  const publicPath = path.join(publicDir, filename);
  try {
    if (fs.existsSync(publicPath)) {
      fs.unlinkSync(publicPath);
      deleted = true;
    }
  } catch (e) {}

  const tmpPath = path.join(tmpDir, filename);
  try {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
      deleted = true;
    }
  } catch (e) {}

  return deleted;
}

// 5. Delete Entire Font Family
export async function deleteFontFamily(familyId) {
  let deletedCount = 0;
  const sql = getSql();

  if (sql) {
    try {
      const res = await sql`DELETE FROM font_files WHERE family_id = ${familyId};`;
      return true;
    } catch (err) {
      console.error('Error deleting family from Neon DB:', err);
    }
  }

  const allFiles = await getAllFontFiles();
  for (const fileObj of allFiles) {
    if (isFontMatchingFamily(fileObj.filename, familyId)) {
      if (await deleteFontFile(fileObj.filename)) {
        deletedCount++;
      }
    }
  }

  return deletedCount > 0;
}

export function parseFontFileInfo(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!['.woff2', '.woff', '.ttf', '.otf'].includes(ext)) {
    return null;
  }

  const baseName = path.basename(filename, ext);

  const weightMap = {
    thin: 100,
    hairline: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    regular: 400,
    normal: 400,
    book: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  };

  let weight = 400;
  const weightMatch = baseName.match(/(100|200|300|400|500|600|700|800|900)/);
  if (weightMatch) {
    weight = parseInt(weightMatch[1], 10);
  } else {
    const lowerName = baseName.toLowerCase();
    for (const [key, val] of Object.entries(weightMap)) {
      if (lowerName.includes(key)) {
        weight = val;
        break;
      }
    }
  }

  const isItalic = baseName.toLowerCase().includes('italic') || baseName.toLowerCase().includes('oblique');

  let cleanFamilyBase = baseName
    .replace(/(100|200|300|400|500|600|700|800|900)/g, '')
    .replace(/(normal|italic|oblique|regular|semibold|demibold|extrabold|ultrabold|extralight|ultralight|bold|light|thin|medium|black|heavy|book)/gi, '')
    .replace(/[-_]+$/g, '')
    .replace(/^[-_]+/g, '')
    .trim();

  if (!cleanFamilyBase) {
    cleanFamilyBase = baseName.split(/[-_]/)[0] || 'CustomFont';
  }

  const familyName = cleanFamilyBase
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();

  const familyId = familyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const normalizedFamily = familyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const format = ext === '.woff2' ? 'woff2' : ext === '.woff' ? 'woff' : ext === '.otf' ? 'opentype' : 'truetype';

  return {
    filename,
    extension: ext,
    format,
    weight,
    isItalic,
    cleanFamilyBase,
    familyName,
    familyId,
    normalizedFamily,
    category: familyName.toLowerCase().includes('loop') ? 'Thai Loop' : 'Thai Sans',
  };
}

export function isFontMatchingFamily(filename, targetFamilyStr) {
  if (!targetFamilyStr) return false;
  const info = parseFontFileInfo(filename);
  if (!info) return false;

  const targetNorm = targetFamilyStr.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetId = targetFamilyStr.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    info.normalizedFamily === targetNorm ||
    info.familyId === targetId ||
    info.familyName.toLowerCase() === targetFamilyStr.toLowerCase().trim()
  );
}

export async function getSystemVersion() {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT value FROM system_settings WHERE key = 'version' LIMIT 1;`;
      if (rows && rows.length > 0) return rows[0].value;
    } catch (e) {}
  }

  const tmpVerPath = path.join(os.tmpdir(), 'version.json');
  const dataVerPath = path.join(process.cwd(), 'data', 'version.json');

  try {
    if (fs.existsSync(tmpVerPath)) {
      const data = JSON.parse(fs.readFileSync(tmpVerPath, 'utf8'));
      if (data.version) return data.version;
    }
    if (fs.existsSync(dataVerPath)) {
      const data = JSON.parse(fs.readFileSync(dataVerPath, 'utf8'));
      if (data.version) return data.version;
    }
  } catch (e) {}

  return 'v1.2.0';
}

export async function saveSystemVersion(newVer) {
  const formattedVer = newVer.startsWith('v') ? newVer : `v${newVer}`;
  const sql = getSql();

  if (sql) {
    try {
      await sql`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ('version', ${formattedVer}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;
    } catch (e) {
      console.error('Error saving version to Neon DB:', e);
    }
  }

  const tmpVerPath = path.join(os.tmpdir(), 'version.json');
  const dataVerPath = path.join(process.cwd(), 'data', 'version.json');

  try {
    fs.writeFileSync(tmpVerPath, JSON.stringify({ version: formattedVer }, null, 2));
  } catch (e) {}

  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataVerPath, JSON.stringify({ version: formattedVer }, null, 2));
  } catch (e) {}

  return formattedVer;
}

