import fs from 'fs';
import path from 'path';
import os from 'os';

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

export function getAllFontFiles() {
  const { publicDir, tmpDir } = getFontsDirs();
  const fileMap = new Map();

  // 1. Read static bundled public/fonts
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
  } catch (e) {
    console.error('Error reading public/fonts:', e);
  }

  // 2. Read runtime uploaded /tmp/fonts (overrides or adds new uploads)
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
  } catch (e) {
    console.error('Error reading tmp/fonts:', e);
  }

  return Array.from(fileMap.values());
}

export function writeFontFile(filename, buffer) {
  const { publicDir, tmpDir } = getFontsDirs();

  // Try writing to public/fonts (local dev)
  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const publicPath = path.join(publicDir, filename);
    fs.writeFileSync(publicPath, buffer);
    return publicPath;
  } catch (err) {
    // If read-only filesystem (Vercel EROFS), write to /tmp/fonts
    const tmpPath = path.join(tmpDir, filename);
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
  }
}

export function deleteFontFile(filename) {
  const { publicDir, tmpDir } = getFontsDirs();
  let deleted = false;

  const publicPath = path.join(publicDir, filename);
  try {
    if (fs.existsSync(publicPath)) {
      fs.unlinkSync(publicPath);
      deleted = true;
    }
  } catch (e) {
    // EROFS ignore
  }

  const tmpPath = path.join(tmpDir, filename);
  try {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
      deleted = true;
    }
  } catch (e) {
    // ignore
  }

  return deleted;
}

export function getSystemVersion() {
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
  } catch (e) {
    // fallback
  }

  return 'v1.2.0';
}

export function saveSystemVersion(newVer) {
  const formattedVer = newVer.startsWith('v') ? newVer : `v${newVer}`;
  const tmpVerPath = path.join(os.tmpdir(), 'version.json');
  const dataVerPath = path.join(process.cwd(), 'data', 'version.json');

  // Always write to /tmp
  try {
    fs.writeFileSync(tmpVerPath, JSON.stringify({ version: formattedVer }, null, 2));
  } catch (e) {
    console.error('Error writing tmp version:', e);
  }

  // Try writing to data/version.json if writable
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataVerPath, JSON.stringify({ version: formattedVer }, null, 2));
  } catch (e) {
    // EROFS silent catch on Vercel
  }

  return formattedVer;
}
