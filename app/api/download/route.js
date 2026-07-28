import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllFontFiles } from '@/lib/fontsStorage';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file') || '';
  const family = searchParams.get('family') || '';

  const allFontFiles = getAllFontFiles();

  if (fileName) {
    const match = allFontFiles.find(f => f.filename === fileName);
    if (match && fs.existsSync(match.fullPath)) {
      const fileBuffer = fs.readFileSync(match.fullPath);
      const ext = path.extname(fileName).toLowerCase();
      const mimeType = ext === '.ttf' ? 'font/ttf' : ext === '.otf' ? 'font/otf' : 'font/woff2';
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Try matching .ttf if .woff2 requested
    const altMatch = allFontFiles.find(f => f.filename.toLowerCase() === fileName.replace(/\.woff2$/i, '.ttf').toLowerCase());
    if (altMatch && fs.existsSync(altMatch.fullPath)) {
      const fileBuffer = fs.readFileSync(altMatch.fullPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'font/ttf',
          'Content-Disposition': `attachment; filename="${altMatch.filename}"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
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
