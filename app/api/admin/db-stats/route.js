import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { getAllFontFiles, getSystemVersion } from '@/lib/fontsStorage';

export async function GET(request) {
  const startTime = Date.now();
  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      status: 'disconnected',
      message: 'DATABASE_URL is not configured in .env',
      provider: 'Local Storage Fallback',
      latencyMs: 0,
      storage: {
        usedBytes: 0,
        usedFormatted: '0 MB',
        totalQuotaFormatted: '512 MB (Neon Free Tier)',
        remainingFormatted: '512 MB',
        usagePercent: 0,
      },
      content: {
        totalFiles: 0,
        totalFamilies: 0,
        formats: {},
      }
    });
  }

  try {
    // 1. Measure Latency & Version
    const verRes = await sql`SELECT version(), current_database() as db_name;`;
    const latencyMs = Date.now() - startTime;
    const pgVersion = verRes[0]?.version?.split(' ')?.[1] || 'PostgreSQL';
    const dbName = verRes[0]?.db_name || 'neondb';

    // 2. Query Font Statistics
    const statsRes = await sql`
      SELECT 
        COUNT(*)::int as total_files,
        COUNT(DISTINCT family_id)::int as total_families,
        COALESCE(SUM(size_bytes), 0)::bigint as total_bytes
      FROM font_files;
    `;

    // 3. Query Formats breakdown
    const formatsRes = await sql`
      SELECT format, COUNT(*)::int as count 
      FROM font_files 
      GROUP BY format;
    `;

    // 4. Query Latest uploaded file
    const latestRes = await sql`
      SELECT filename, family_name, format, size_bytes, created_at 
      FROM font_files 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    const totalFiles = statsRes[0]?.total_files || 0;
    const totalFamilies = statsRes[0]?.total_families || 0;
    const usedBytes = Number(statsRes[0]?.total_bytes || 0);

    // Neon Free Tier provides 512 MB storage
    const totalQuotaBytes = 512 * 1024 * 1024;
    const remainingBytes = Math.max(0, totalQuotaBytes - usedBytes);
    const usagePercent = Math.min(100, ((usedBytes / totalQuotaBytes) * 100));

    const formats = {};
    formatsRes.forEach(r => {
      formats[r.format] = r.count;
    });

    const formatSize = (bytes) => {
      if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return bytes + ' B';
    };

    return NextResponse.json({
      status: 'connected',
      provider: 'Neon Serverless PostgreSQL (Cloud)',
      database: dbName,
      pgVersion: `PostgreSQL v${pgVersion}`,
      latencyMs,
      storage: {
        usedBytes,
        usedFormatted: formatSize(usedBytes),
        totalQuotaBytes,
        totalQuotaFormatted: '512.0 MB (Neon Free Tier)',
        remainingBytes,
        remainingFormatted: formatSize(remainingBytes),
        usagePercent: usagePercent.toFixed(2),
        estimatedRemainingFiles: Math.floor(remainingBytes / 45000), // ~45KB average font size
      },
      content: {
        totalFiles,
        totalFamilies,
        formats,
        latestUpload: latestRes[0] || null,
      },
      serverTime: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (err) {
    console.error('Error fetching db stats:', err);
    return NextResponse.json({
      status: 'error',
      message: err.message,
      latencyMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
