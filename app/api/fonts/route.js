import { NextResponse } from 'next/server';
import path from 'path';
import { getAllFontFiles, getSystemVersion } from '../../lib/fontsStorage';

export async function GET() {
  const allFiles = getAllFontFiles();
  const systemVersion = getSystemVersion();

  let uploadedFiles = [];
  let fontFamilies = {};

  const weightMap = {
    thin: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    regular: 400,
    normal: 400,
    book: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  };

  try {
    allFiles.forEach(fileObj => {
      const file = fileObj.filename;
      const ext = path.extname(file).toLowerCase();
      
      if (['.woff2', '.woff', '.ttf', '.otf'].includes(ext)) {
        uploadedFiles.push({
          filename: file,
          sizeBytes: fileObj.size,
          sizeKb: (fileObj.size / 1024).toFixed(1),
          extension: ext,
        });

        const baseName = path.basename(file, ext);
        
        let weight = 400;
        const weightMatch = baseName.match(/(100|200|300|400|500|600|700|800|900)/);
        if (weightMatch) {
          weight = parseInt(weightMatch[1], 10);
        } else {
          const lowerName = baseName.toLowerCase();
          for (const [key, val] of Object.entries(weightMap)) {
            if (lowerName.includes(key)) {
              weight = val;
              break;
            }
          }
        }

        let cleanFamilyBase = baseName
          .replace(/(100|200|300|400|500|600|700|800|900)/g, '')
          .replace(/(normal|italic|oblique|regular|bold|light|thin|medium|black|semibold|extrabold)/gi, '')
          .replace(/[-_]+$/g, '')
          .replace(/^[-_]+/g, '')
          .trim();

        if (!cleanFamilyBase) cleanFamilyBase = baseName.split(/[-_]/)[0] || 'CustomFont';

        const familyName = cleanFamilyBase.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
        const familyId = familyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const isItalic = baseName.toLowerCase().includes('italic');

        if (!fontFamilies[familyId]) {
          fontFamilies[familyId] = {
            id: familyId,
            name: familyName,
            category: familyName.toLowerCase().includes('loop') ? 'Thai Loop' : 'Thai Sans',
            designer: 'Private Upload',
            weights: new Set(),
            hasItalic: false,
            files: [],
            defaultWeight: 400,
            isLocal: true,
          };
        }

        fontFamilies[familyId].weights.add(weight);
        if (isItalic) fontFamilies[familyId].hasItalic = true;
        fontFamilies[familyId].files.push(file);
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
