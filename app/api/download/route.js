import { NextResponse } from 'next/server';
import path from 'path';
import { getFontFileBuffer } from '@/lib/fontsStorage';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file') || '';
  const family = searchParams.get('family') || '';
  const isDownload = searchParams.get('download') === '1' || searchParams.get('dl') === '1';

  if (fileName) {
    let fontData = await getFontFileBuffer(fileName);

    // Fallback: try matching .ttf if .woff2 was requested and not found
    if (!fontData && fileName.toLowerCase().endsWith('.woff2')) {
      const altName = fileName.replace(/\.woff2$/i, '.ttf');
      fontData = await getFontFileBuffer(altName);
    }

    if (fontData && fontData.buffer) {
      const ext = path.extname(fontData.filename).toLowerCase();
      const mimeType =
        ext === '.ttf' ? 'font/ttf' :
        ext === '.otf' ? 'font/otf' :
        ext === '.woff' ? 'font/woff' :
        'font/woff2';

      const headers = {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=31536000, immutable',
      };

      if (isDownload) {
        headers['Content-Disposition'] = `attachment; filename="${fontData.filename}"`;
      }

      return new NextResponse(fontData.buffer, { headers });
    }
  }

  const targetName = (fileName || family || 'ThaiFont').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dummyBuffer = Buffer.from(`/* Desktop Font File Package for ${targetName} */\n`);
  
  return new NextResponse(dummyBuffer, {
    headers: {
      'Content-Type': 'font/ttf',
      'Content-Disposition': `attachment; filename="${targetName}.ttf"`,
    },
  });
}
