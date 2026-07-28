import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('fonts');

    if (!files || files.length === 0) {
      return NextResponse.json({ status: 'error', message: 'No font files uploaded' }, { status: 400 });
    }

    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
    }

    let savedFiles = [];

    for (const file of files) {
      if (typeof file === 'object' && file.name) {
        const ext = path.extname(file.name).toLowerCase();
        if (['.woff2', '.woff', '.ttf', '.otf'].includes(ext)) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const targetPath = path.join(fontsDir, file.name);

          fs.writeFileSync(targetPath, buffer);
          savedFiles.push(file.name);
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Successfully uploaded ${savedFiles.length} font file(s)`,
      files: savedFiles,
    });
  } catch (err) {
    console.error('Font upload error:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
