import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const familyParam = searchParams.get('family');
  const familiesParam = searchParams.get('families');

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const zip = new AdmZip();

  let targetFamilies = [];
  if (familiesParam) {
    targetFamilies = familiesParam.split(',').map(f => f.trim().toLowerCase());
  } else if (familyParam) {
    targetFamilies = [familyParam.trim().toLowerCase()];
  }

  let zipFileName = 'ThaiFonts_Package_v1.2.0.zip';
  if (familyParam && !familiesParam) {
    zipFileName = `${familyParam.replace(/[^a-zA-Z0-9_-]/g, '_')}_Fonts.zip`;
  }

  try {
    if (fs.existsSync(fontsDir)) {
      const files = fs.readdirSync(fontsDir);

      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (['.woff2', '.woff', '.ttf', '.otf'].includes(ext)) {
          const normFile = file.toLowerCase().replace(/[^a-z0-9]/g, '');

          // Check if file belongs to requested target families (or include all if no specific family specified)
          const matches = targetFamilies.length === 0 || targetFamilies.some(fam => {
            const normFam = fam.replace(/[^a-z0-9]/g, '');
            return normFile.includes(normFam);
          });

          if (matches) {
            const filePath = path.join(fontsDir, file);
            if (fs.existsSync(filePath)) {
              const fileBuffer = fs.readFileSync(filePath);
              zip.addFile(file, fileBuffer);
            }
          }
        }
      });
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error generating ZIP archive:', err);
    return new NextResponse('/* Error generating ZIP font package */', { status: 500 });
  }
}
