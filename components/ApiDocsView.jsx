'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFontContext } from '../context/FontContext';
import { Code2, Server, Check, Copy, ExternalLink, ShieldCheck, Zap, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import SyntaxHighlighter from './SyntaxHighlighter';

export default function ApiDocsView() {
  const { selectedFonts, setIsDrawerOpen } = useFontContext();
  const [display, setDisplay] = useState('swap');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState('link');
  const [fetchedCss, setFetchedCss] = useState('');
  const [isLoadingCss, setIsLoadingCss] = useState(false);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';
  
  // Build query string directly from selectedFonts in context
  const familyParamsStr = selectedFonts
    .map(f => {
      const weights = f.selectedWeights?.length ? f.selectedWeights : [400];
      const sortedWeights = [...weights].sort((a, b) => a - b);
      return `family=${encodeURIComponent(f.name).replace(/%20/g, '+')}:wght@${sortedWeights.join(';')}`;
    })
    .join('&');

  const fullApiUrl = familyParamsStr 
    ? `${originUrl}/api/css2?${familyParamsStr}&display=${display}`
    : '';

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSnippet(type);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  const handleTestFetchCss = async () => {
    if (!fullApiUrl) return;
    setIsLoadingCss(true);
    try {
      const res = await fetch(fullApiUrl);
      const text = await res.text();
      setFetchedCss(text);
    } catch (err) {
      setFetchedCss(`/* Error fetching CSS: ${err.message} */`);
    } finally {
      setIsLoadingCss(false);
    }
  };

  const linkSnippet = fullApiUrl 
    ? `<link rel="preconnect" href="${originUrl}">\n<link rel="stylesheet" href="${fullApiUrl}">`
    : '';

  const importSnippet = fullApiUrl
    ? `@import url('${fullApiUrl}');`
    : '';

  const cssRulesSnippet = selectedFonts.length > 0
    ? selectedFonts.map(f => `font-family: '${f.name}', sans-serif;`).join('\n')
    : '';

  const fontDisplayOptions = {
    swap: {
      tag: 'แนะนำสำหรับเว็บทั่วไป',
      summary: 'แสดงข้อความด้วยฟอนต์สำรองทันที แล้วสลับเป็นฟอนต์จริงเมื่อดาวน์โหลดเสร็จ (ป้องกันหน้าว่าง / Flash of Invisible Text)',
      details: 'ระยะเวลารอ: ซ่อน 0 วิ ➔ สลับฟอนต์จริงทันทีที่โหลดเสร็จ',
    },
    block: {
      tag: 'เหมาะสำหรับโลโก้ / ไอคอน',
      summary: 'ซ่อนข้อความชั่วครู่ (~3 วินาที) เพื่อรอฟอนต์จริงโหลดเสร็จ ป้องกันตัวอักษรกระตุกเปลี่ยนรูปทรง',
      details: 'ระยะเวลารอ: ซ่อนสูงสุด 3 วิ ➔ หากโหลดไม่ทันจึงใช้ฟอนต์สำรอง',
    },
    fallback: {
      tag: 'เหมาะสำหรับเนื้อหาบทความ',
      summary: 'ให้เวลารอฟอนต์จริงสั้นมาก (~100ms) หากโหลดไม่ทันจะใช้ฟอนต์สำรองทันที และยอมให้สลับได้ภายใน 3 วินาที',
      details: 'ระยะเวลารอ: ซ่อน 0.1 วิ ➔ ยอมให้สลับฟอนต์จริงได้ภายใน 3 วิ',
    },
    optional: {
      tag: 'ประสิทธิภาพสูงสุด / มือถือเน็ตช้า',
      summary: 'ให้เวลารอฟอนต์จริงสั้นมาก (~100ms) หากโหลดไม่ทันจะไม่สลับฟอนต์ในรอบนี้ แต่จะแคชไว้ใช้ในการเปิดหน้าถัดไป',
      details: 'ระยะเวลารอ: ซ่อน 0.1 วิ ➔ ไม่มีการกระตุกเปลี่ยนฟอนต์กลางคัน',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Hero Bento Section */}
      <div className="p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] shadow-xs relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200/60 dark:border-blue-800/60">
          <Server className="w-3.5 h-3.5" />
          <span>Serverless Dynamic Font Generator</span>
        </div>
        
        <h1 className="font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight leading-tight">
          Google Fonts-Compatible CSS2 API Endpoint
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          เสิร์ฟไฟล์ฟอนต์ไทยส่วนตัวจาก Neon Postgres เข้าสู่ทุกโปรเจกต์ของคุณผ่าน Serverless Dynamic CSS API โดยไม่ติด CORS พร้อมรองรับการแคชความเร็วสูงระดับ CDN
        </p>
      </div>

      {/* Grid Features - Bento Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-base">CORS Unlocked (*)</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            ระบบส่ง Header <code>Access-Control-Allow-Origin: *</code> ให้นำไปวางใน <code>@import</code> หรือ <code>&lt;link&gt;</code> บนเว็บไซต์ใดก็ได้ทันที
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-base">Dynamic URL Generator</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            รองรับ Query String <code>?family=Name:wght@400;700</code> รูปแบบเดียวกับ Google Fonts API v2 เป๊ะๆ
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-base">Neon DB Powered</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            ดึงไฟล์ฟอนต์ไบนารีจาก Neon Cloud Database โดยตรง ไม่พึ่งพาไฟล์บนเครื่องเซิร์ฟเวอร์
          </p>
        </div>
      </div>

      {/* Interactive API Tester & Generator Bento Container */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] space-y-6 shadow-2xs">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
              Dynamic API Endpoint &amp; Embed Code
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              สร้าง URL และโค้ด Embed จากฟอนต์ที่คุณเลือกจากหน้า Font Catalog อัตโนมัติ
            </p>
          </div>

          {fullApiUrl && (
            <a
              href={fullApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-[#1c1f26] text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <span>Open Endpoint in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Selected Fonts from Front Page */}
        {selectedFonts.length === 0 ? (
          /* Empty State */
          <div className="py-12 text-center bg-zinc-50/50 dark:bg-[#121317] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              <Code2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                ยังไม่ได้เลือกฟอนต์จากหน้าหลัก
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                กรุณาไปที่หน้า <strong>Font Catalog</strong> แล้วกดปุ่ม <strong>"+ Get font"</strong> เพื่อเลือกฟอนต์ที่ต้องการใช้งาน
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับไปเลือกฟอนต์ที่หน้า Font Catalog</span>
            </Link>
          </div>
        ) : (
          /* Selected Fonts Active State */
          <div className="space-y-6">
            
            {/* Selected Families Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  ฟอนต์ที่เลือกจากหน้าหลัก ({selectedFonts.length} ตระกูล):
                </label>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  จัดการฟอนต์ที่เลือก (Selected Drawer)
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedFonts.map(f => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                    <span>{f.name}</span>
                    <span className="text-[11px] font-mono text-blue-600/80 dark:text-blue-400/80 font-normal">
                      (wght: {f.selectedWeights?.join(', ') || '400'})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Parameter Selector & Dynamic Explanation Card */}
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Font-Display:</span>
                <div className="flex bg-zinc-100 dark:bg-[#1c1f26] p-1 rounded-2xl gap-1 text-xs border border-zinc-200/80 dark:border-zinc-800">
                  {['swap', 'block', 'fallback', 'optional'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDisplay(d)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                        display === d
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Explanation Card */}
              {fontDisplayOptions[display] && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#121317] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                      font-display: {display};
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                      {fontDisplayOptions[display].tag}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {fontDisplayOptions[display].summary}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                    ⏱️ {fontDisplayOptions[display].details}
                  </p>
                </div>
              )}
            </div>

            {/* Live URL Output Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Generated API Endpoint Request URL:
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={fullApiUrl}
                  className="w-full pl-4 pr-24 py-3 rounded-2xl bg-zinc-950 font-mono text-xs text-emerald-400 font-semibold border border-zinc-800 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(fullApiUrl, 'url')}
                  className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Embed Code Snippets Tabs */}
            <div className="space-y-3 pt-2">
              <div className="flex bg-zinc-100 dark:bg-[#1c1f26] p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 max-w-md">
                <button
                  onClick={() => setActiveSnippetTab('link')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    activeSnippetTab === 'link'
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  &lt;link&gt;
                </button>
                <button
                  onClick={() => setActiveSnippetTab('import')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    activeSnippetTab === 'import'
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  @import
                </button>
                <button
                  onClick={() => setActiveSnippetTab('css')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    activeSnippetTab === 'css'
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  CSS Rules
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap break-all">
                  <SyntaxHighlighter
                    code={
                      activeSnippetTab === 'link'
                        ? linkSnippet
                        : activeSnippetTab === 'import'
                        ? importSnippet
                        : cssRulesSnippet
                    }
                    language={activeSnippetTab === 'link' ? 'html' : 'css'}
                  />
                </pre>
                <button
                  onClick={() =>
                    handleCopy(
                      activeSnippetTab === 'link'
                        ? linkSnippet
                        : activeSnippetTab === 'import'
                        ? importSnippet
                        : cssRulesSnippet,
                      activeSnippetTab
                    )
                  }
                  className="mt-2.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {copiedSnippet === activeSnippetTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                      <span>คัดลอก Snippet เรียบร้อย!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด Embed</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Execute Test Request */}
            <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleTestFetchCss}
                disabled={isLoadingCss}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs active:scale-95"
              >
                <Code2 className="w-4 h-4" />
                <span>{isLoadingCss ? 'Fetching CSS...' : 'Test Fetch Live CSS Output'}</span>
              </button>

              {fetchedCss && (
                <div className="space-y-1 animate-fade-in pt-2">
                  <span className="text-xs font-mono text-zinc-400">Response Header: Content-Type: text/css; charset=utf-8</span>
                  <pre className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono text-xs max-h-72 overflow-y-auto border border-zinc-200 dark:border-zinc-800 leading-relaxed whitespace-pre-wrap">
                    <SyntaxHighlighter code={fetchedCss} language="css" />
                  </pre>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
