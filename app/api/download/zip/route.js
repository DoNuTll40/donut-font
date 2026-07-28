import { NextResponse } from 'next/server';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { getAllFontFiles, getSystemVersion } from '@/lib/fontsStorage';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const familyParam = searchParams.get('family');
  const familiesParam = searchParams.get('families');

  const allFontFiles = getAllFontFiles();
  const currentVersion = getSystemVersion();
  const zip = new AdmZip();

  let targetFamilies = [];
  if (familiesParam) {
    targetFamilies = familiesParam.split(',').map(f => f.trim().toLowerCase());
  } else if (familyParam) {
    targetFamilies = [familyParam.trim().toLowerCase()];
  }

  let zipFileName = `ThaiFonts_Package_${currentVersion}.zip`;
  if (familyParam && !familiesParam) {
    zipFileName = `${familyParam.replace(/[^a-zA-Z0-9_-]/g, '_')}_Fonts.zip`;
  }

  try {
    allFontFiles.forEach(fileObj => {
      const file = fileObj.filename;
      const normFile = file.toLowerCase().replace(/[^a-z0-9]/g, '');

      const matches = targetFamilies.length === 0 || targetFamilies.some(fam => {
        const normFam = fam.replace(/[^a-z0-9]/g, '');
        return normFile.includes(normFam);
      });

      if (matches && fs.existsSync(fileObj.fullPath)) {
        const fileBuffer = fs.readFileSync(fileObj.fullPath);
        zip.addFile(file, fileBuffer);
      }
    });

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
