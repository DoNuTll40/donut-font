import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REQUIRED_PIN = '001140';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, pin, filename, familyId, newVersion } = body;

    // PIN Verification
    if (pin !== REQUIRED_PIN) {
      return NextResponse.json({ status: 'error', message: 'PIN Code ไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง' }, { status: 401 });
    }

    const fontsDir = path.join(process.cwd(), 'public', 'fonts');

    // 1. Delete single file
    if (action === 'delete-file' && filename) {
      const targetPath = path.join(fontsDir, filename);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        return NextResponse.json({ status: 'success', message: `ลบไฟล์ ${filename} เรียบร้อยแล้ว` });
      }
      return NextResponse.json({ status: 'error', message: 'ไม่พบไฟล์ที่ต้องการลบ' }, { status: 404 });
    }

    // 2. Delete entire family
    if (action === 'delete-family' && familyId) {
      if (fs.existsSync(fontsDir)) {
        const files = fs.readdirSync(fontsDir);
        let deletedCount = 0;

        files.forEach(file => {
          const normFile = file.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normFam = familyId.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normFile.includes(normFam)) {
            fs.unlinkSync(path.join(fontsDir, file));
            deletedCount++;
          }
        });

        return NextResponse.json({ status: 'success', message: `ลบฟอนต์ตระกูลนี้เรียบร้อยแล้ว (${deletedCount} ไฟล์)` });
      }
    }

    // 3. Update system version in data/version.json and package.json
    if (action === 'update-version' && newVersion) {
      const formattedVer = newVersion.startsWith('v') ? newVersion : `v${newVersion}`;
      
      // Save to data/version.json
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const versionPath = path.join(dataDir, 'version.json');
      fs.writeFileSync(versionPath, JSON.stringify({ version: formattedVer }, null, 2));

      // Save to package.json
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          pkgData.version = formattedVer.replace(/^v/, '');
          fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2));
        } catch (e) {
          console.error('Error writing package.json version:', e);
        }
      }

      return NextResponse.json({
        status: 'success',
        version: formattedVer,
        message: `อัปเดตเวอร์ชันระบบเป็น ${formattedVer} เรียบร้อยแล้ว`,
      });
    }

    return NextResponse.json({ status: 'error', message: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
