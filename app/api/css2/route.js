import { NextResponse } from 'next/server';
import { getAllFontFiles, parseFontFileInfo, isFontMatchingFamily } from '@/lib/fontsStorage';

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

  const allFontFiles = await getAllFontFiles();

  for (const familyStr of familyParams) {
    const [rawFamilyName] = familyStr.split(':');
    const familyName = rawFamilyName.replace(/\+/g, ' ').trim();

    const matchedLocalFiles = allFontFiles
      .map(fileObj => ({ ...fileObj, info: parseFontFileInfo(fileObj.filename) }))
      .filter(fileObj => fileObj.info && isFontMatchingFamily(fileObj.filename, familyName));

    if (matchedLocalFiles.length > 0) {
      // Group matched files by weight and style so woff2 and ttf are in a single @font-face block
      const styleGroups = new Map();

      matchedLocalFiles.forEach(fileObj => {
        const info = fileObj.info;
        const key = `${info.weight}_${info.isItalic ? 'italic' : 'normal'}`;
        if (!styleGroups.has(key)) {
          styleGroups.set(key, {
            weight: info.weight,
            isItalic: info.isItalic,
            sources: [],
          });
        }
        const fontFileServeUrl = `${baseUrl}/api/download?file=${encodeURIComponent(fileObj.filename)}`;
        styleGroups.get(key).sources.push({
          url: fontFileServeUrl,
          format: info.format,
        });
      });

      styleGroups.forEach(group => {
        // Prioritize woff2 over woff and truetype/opentype
        const sortedSources = group.sources.sort((a, b) => {
          const order = { woff2: 1, woff: 2, truetype: 3, opentype: 4 };
          return (order[a.format] || 5) - (order[b.format] || 5);
        });

        const srcDeclarations = sortedSources
          .map(s => `url('${s.url}') format('${s.format}')`)
          .join(',\n       ');

        cssOutput += `@font-face {\n`;
        cssOutput += `  font-family: '${familyName}';\n`;
        cssOutput += `  font-style: ${group.isItalic ? 'italic' : 'normal'};\n`;
        cssOutput += `  font-weight: ${group.weight};\n`;
        cssOutput += `  font-display: ${display};\n`;
        cssOutput += `  src: ${srcDeclarations};\n`;
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
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

