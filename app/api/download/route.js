import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file') || '';
  const family = searchParams.get('family') || '';

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  if (fileName) {
    const requestedPath = path.join(fontsDir, fileName);
    const ext = path.extname(fileName).toLowerCase();

    // 1. If exact requested file exists, serve it
    if (fs.existsSync(requestedPath)) {
      const fileBuffer = fs.readFileSync(requestedPath);
      const mimeType = ext === '.ttf' ? 'font/ttf' : ext === '.otf' ? 'font/otf' : 'font/woff2';
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. If woff2 was requested but ttf exists (or vice versa), serve available file
    if (ext === '.woff2') {
      const ttfPath = path.join(fontsDir, fileName.replace(/\.woff2$/i, '.ttf'));
      if (fs.existsSync(ttfPath)) {
        const fileBuffer = fs.readFileSync(ttfPath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'font/ttf',
            'Content-Disposition': `attachment; filename="${fileName.replace(/\.woff2$/i, '.ttf')}"`,
          },
        });
      }
    }
  }

  // Fallback demo file generator if file not found
  const targetName = (fileName || family || 'ThaiFont').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dummyBuffer = Buffer.from(`/* Desktop Font File Package for ${targetName} */\n`);
  
  return new NextResponse(dummyBuffer, {
    headers: {
      'Content-Type': 'font/ttf',
      'Content-Disposition': `attachment; filename="${targetName}.ttf"`,
    },
  });
}
