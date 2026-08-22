import { NextResponse } from 'next/server';
import { getAllFontFiles, getSystemVersion, parseFontFileInfo } from '@/lib/fontsStorage';

export async function GET() {
  const allFiles = await getAllFontFiles();
  const systemVersion = await getSystemVersion();

  let uploadedFiles = [];
  let fontFamilies = {};

  try {
    allFiles.forEach(fileObj => {
      const file = fileObj.filename;
      const info = parseFontFileInfo(file);
      
      if (info) {
        uploadedFiles.push({
          filename: file,
          sizeBytes: fileObj.size,
          sizeKb: (fileObj.size / 1024).toFixed(1),
          extension: info.extension,
        });

        if (!fontFamilies[info.familyId]) {
          fontFamilies[info.familyId] = {
            id: info.familyId,
            name: info.familyName,
            category: info.category,
            designer: 'Private Upload',
            weights: new Set(),
            hasItalic: false,
            files: [],
            defaultWeight: 400,
            isLocal: true,
          };
        }

        fontFamilies[info.familyId].weights.add(info.weight);
        if (info.isItalic) fontFamilies[info.familyId].hasItalic = true;
        fontFamilies[info.familyId].files.push(file);
      }
    });
  } catch (err) {
    console.error('Error scanning fonts:', err);
  }

  const familiesArray = Object.values(fontFamilies).map(fam => {
    const weightsArr = Array.from(fam.weights).sort((a, b) => a - b);
    const stylesCountVal = fam.hasItalic ? weightsArr.length * 2 : weightsArr.length;
    return {
      ...fam,
      weights: weightsArr.length > 0 ? weightsArr : [400],
      stylesCount: `${stylesCountVal} styles`,
      tag: fam.hasItalic ? `Local (${weightsArr.length} wghts + Italics)` : `Local (${weightsArr.length} weights)`,
    };
  });

  return NextResponse.json({
    status: 'success',
    version: systemVersion,
    totalFiles: uploadedFiles.length,
    files: uploadedFiles,
    families: familiesArray,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    }
  });
}

