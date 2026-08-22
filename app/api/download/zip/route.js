import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { getAllFontFiles, getBatchFontFiles, getSystemVersion, isFontMatchingFamily, parseFontFileInfo } from '@/lib/fontsStorage';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const familyParam = searchParams.get('family');
  const familiesParam = searchParams.get('families');

  const allFontFiles = await getAllFontFiles();
  const currentVersion = await getSystemVersion();
  const zip = new AdmZip();

  let targetFamilies = [];
  if (familiesParam) {
    targetFamilies = familiesParam.split(',').map(f => f.trim()).filter(Boolean);
  } else if (familyParam) {
    targetFamilies = [familyParam.trim()];
  }

  let zipFileName = `ThaiFonts_Package_${currentVersion}.zip`;
  if (familyParam && !familiesParam) {
    zipFileName = `${familyParam.replace(/[^a-zA-Z0-9_-]/g, '_')}_Fonts.zip`;
  }

  try {
    const matchedFilenames = [];
    for (const fileObj of allFontFiles) {
      const file = fileObj.filename;
      const info = parseFontFileInfo(file);
      if (!info) continue;

      const matches = targetFamilies.length === 0 || targetFamilies.some(fam => isFontMatchingFamily(file, fam));
      if (matches) {
        matchedFilenames.push(file);
      }
    }

    // Fast Single Batch Query
    const fontDataList = await getBatchFontFiles(matchedFilenames);
    for (const fontData of fontDataList) {
      if (fontData && fontData.buffer) {
        zip.addFile(fontData.filename, fontData.buffer);
      }
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error generating ZIP archive:', err);
    return new NextResponse('/* Error generating ZIP font package */', { status: 500 });
  }
}
