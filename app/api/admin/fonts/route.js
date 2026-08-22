import { NextResponse } from 'next/server';
import { getAllFontFiles, deleteFontFile, deleteFontFamily, saveSystemVersion, isFontMatchingFamily } from '@/lib/fontsStorage';

const REQUIRED_PIN = '001140';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, pin, filename, familyId, newVersion } = body;

    // PIN Verification
    if (pin !== REQUIRED_PIN) {
      return NextResponse.json({ status: 'error', message: 'PIN Code ไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง' }, { status: 401 });
    }

    // 1. Delete single file
    if (action === 'delete-file' && filename) {
      const deleted = await deleteFontFile(filename);
      if (deleted) {
        return NextResponse.json({ status: 'success', message: `ลบไฟล์ ${filename} เรียบร้อยแล้ว` });
      }
      return NextResponse.json({ status: 'error', message: 'ไม่พบไฟล์ที่ต้องการลบ' }, { status: 404 });
    }

    // 2. Delete entire family
    if (action === 'delete-family' && familyId) {
      const success = await deleteFontFamily(familyId);
      return NextResponse.json({ status: 'success', message: `ลบฟอนต์ตระกูลนี้เรียบร้อยแล้ว` });
    }

    // 3. Update system version
    if (action === 'update-version' && newVersion) {
      const savedVersion = await saveSystemVersion(newVersion);
      return NextResponse.json({
        status: 'success',
        version: savedVersion,
        message: `อัปเดตเวอร์ชันระบบเป็น ${savedVersion} เรียบร้อยแล้ว`,
      });
    }

    return NextResponse.json({ status: 'error', message: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
