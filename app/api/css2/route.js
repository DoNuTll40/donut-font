import { NextResponse } from 'next/server';
import path from 'path';
import { getAllFontFiles } from '../../lib/fontsStorage';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const familyParams = searchParams.getAll('family');
  const display = searchParams.get('display') || 'swap';

  if (!familyParams || familyParams.length === 0) {
    return new NextResponse('/* Error: Missing family parameter */', {
      status: 400,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;

  let cssOutput = `/* Private Thai Font Vault API - Serverless Vercel Engine */\n\n`;

  const allFontFiles = getAllFontFiles();

  for (const familyStr of familyParams) {
    const [rawFamilyName] = familyStr.split(':');
    const familyName = rawFamilyName.replace(/\+/g, ' ');
    const normalizedFamily = familyName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const matchedLocalFiles = allFontFiles.filter(fileObj => {
      const normFile = fileObj.filename.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normFile.includes(normalizedFamily);
    });

    if (matchedLocalFiles.length > 0) {
      matchedLocalFiles.forEach(fileObj => {
        const file = fileObj.filename;
        const ext = path.extname(file).replace('.', '').toLowerCase();
        const format = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : 'truetype';
        
        let fileWeight = 400;
        const weightMatch = file.match(/(100|200|300|400|500|600|700|800|900)/);
        if (weightMatch) fileWeight = parseInt(weightMatch[1], 10);

        const isItalic = file.toLowerCase().includes('italic');

        // Font file serve URL: if file is in /tmp or public, serve via /api/download?file=...
        const fontFileServeUrl = `${baseUrl}/api/download?file=${encodeURIComponent(file)}`;

        cssOutput += `@font-face {\n`;
        cssOutput += `  font-family: '${familyName}';\n`;
        cssOutput += `  font-style: ${isItalic ? 'italic' : 'normal'};\n`;
        cssOutput += `  font-weight: ${fileWeight};\n`;
        cssOutput += `  font-display: ${display};\n`;
        cssOutput += `  src: url('${fontFileServeUrl}') format('${format}');\n`;
        cssOutput += `  unicode-range: U+0E00-0E7F, U+0000-00FF, U+0100-017F, U+0200-024F, U+0500-052F;\n`;
        cssOutput += `}\n\n`;
      });
    } else {
      cssOutput += `/* Font family '${familyName}' has not been uploaded to this private vault. */\n\n`;
    }
  }

  return new NextResponse(cssOutput, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
