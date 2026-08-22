'use client';

import React, { useState, useEffect } from 'react';
import { useFontContext } from '../context/FontContext';
import { X, Copy, Check, Trash2, Download, Code2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SyntaxHighlighter from './SyntaxHighlighter';

const weightLabels = {
  100: 'Thin 100',
  200: 'ExtraLight 200',
  300: 'Light 300',
  400: 'Regular 400',
  500: 'Medium 500',
  600: 'SemiBold 600',
  700: 'Bold 700',
  800: 'ExtraBold 800',
  900: 'Black 900',
};

export default function SelectedFontsDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    selectedFonts,
    removeFont,
    toggleWeight,
    toggleAllWeights,
    clearAllFonts,
    previewText
  } = useFontContext();
  const [activeTab, setActiveTab] = useState('import');
  const [copiedTab, setCopiedTab] = useState(null);
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Prevent background body scrolling safely without breaking sticky elements
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const toggleExpand = (fontId) => {
    setExpandedFamilies(prev => ({
      ...prev,
      [fontId]: !prev[fontId],
    }));
  };

  const familyParams = selectedFonts
    .map(f => {
      const sortedWeights = [...(f.selectedWeights || [])].sort((a, b) => a - b);
      const weightStr = sortedWeights.length > 0 ? `:wght@${sortedWeights.join(';')}` : '';
      return `family=${encodeURIComponent(f.name).replace(/%20/g, '+')}${weightStr}`;
    })
    .filter(Boolean)
    .join('&');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';
  const apiUrl = familyParams ? `${originUrl}/api/css2?${familyParams}&display=swap` : '';

  const linkSnippet = apiUrl ? `<link rel="preconnect" href="${originUrl}">\n<link rel="stylesheet" href="${apiUrl}">` : '';
  const importSnippet = apiUrl ? `@import url('${apiUrl}');` : '';
  const cssRulesSnippet = selectedFonts.map(f => `font-family: '${f.name}', sans-serif;`).join('\n');

  const selectedFamilyNames = selectedFonts.map(f => f.name.replace(/\s+/g, '')).join(',');
  const zipDownloadAllUrl = `/api/download/zip?families=${encodeURIComponent(selectedFamilyNames)}`;

  const handleCopy = (text, tabName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip || selectedFonts.length === 0) return;
    setIsDownloadingZip(true);
    try {
      const res = await fetch(zipDownloadAllUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ThaiFonts_Selected_${selectedFonts.length}_Families.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ ZIP');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const currentSnippet = activeTab === 'link' ? linkSnippet : activeTab === 'import' ? importSnippet : cssRulesSnippet;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {apiUrl && <link rel="stylesheet" href={apiUrl} />}

          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-6">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="w-screen max-w-md bg-white dark:bg-[#111216] border-l border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header with Compact Download .ZIP + Trash + Close */}
              <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/70 dark:bg-[#0c0d0f] shrink-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight">
                    Selected Fonts
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs font-mono">
                    {selectedFonts.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedFonts.length > 0 && (
                    <>
                      {/* Compact Download .ZIP Button with Active Loading Feedback */}
                      <button
                        onClick={handleDownloadZip}
                        disabled={isDownloadingZip}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                        title={`ดาวน์โหลด ${selectedFonts.length} ตระกูลเป็นไฟล์ .ZIP`}
                      >
                        {isDownloadingZip ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังสร้าง ZIP...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>.ZIP</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
                              {selectedFonts.length}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Clear All Trash Button */}
                      <button
                        onClick={clearAllFonts}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="ลบฟอนต์ที่เลือกทั้งหมด"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Close Drawer Button */}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-none">
                {selectedFonts.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                      ยังไม่ได้เลือกฟอนต์
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      กดปุ่ม <strong>"+ Get font"</strong> ที่การ์ดฟอนต์เพื่อรวมกลุ่มและสร้างโค้ดใช้งานหรือดาวน์โหลดมัดรวม
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 1. Embed Code Section (Themed Bento Box) */}
                    <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Embed Code (Google Fonts API)
                        </span>
                      </div>

                      {/* Segmented Code Tabs */}
                      <div className="flex bg-zinc-200/70 dark:bg-[#1e2028] p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
                        <button
                          onClick={() => setActiveTab('link')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'link'
                              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                          &lt;link&gt;
                        </button>
                        <button
                          onClick={() => setActiveTab('import')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'import'
                              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                          @import
                        </button>
                        <button
                          onClick={() => setActiveTab('css')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'css'
                              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                          CSS rules
                        </button>
                      </div>

                      {/* Syntax-Highlighted Code Box (Theme-Adaptive) */}
                      <div className="relative">
                        <pre className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap break-all">
                          <SyntaxHighlighter code={currentSnippet} language={activeTab === 'link' ? 'html' : 'css'} />
                        </pre>

                        <button
                          onClick={() => handleCopy(currentSnippet, activeTab)}
                          className="mt-2.5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                        >
                          {copiedTab === activeTab ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                              <span>คัดลอกโค้ดเรียบร้อย!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>คัดลอก Embed Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 2. Selected Families & Styles Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Selected Families &amp; Styles ({selectedFonts.length})
                        </span>
                      </div>

                      <div className="space-y-3">
                        {selectedFonts.map((f) => {
                          const isExpanded = expandedFamilies[f.id];
                          const visibleWeights = isExpanded ? f.weights : f.weights.slice(0, 3);
                          const hasMore = f.weights.length > 3;

                          return (
                            <div
                              key={f.id}
                              className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#16171d] overflow-hidden shadow-2xs"
                            >
                              {/* Card Top: Header & Specimen Preview */}
                              <div className="p-4 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                                      {f.name}
                                    </h4>
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 dark:bg-[#1e2028] px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60">
                                      Static
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => removeFont(f.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    title={`Remove ${f.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Dynamic Specimen Text Preview in this Font (Weight 700) */}
                                <div className="relative pt-0.5">
                                  <p
                                    style={{ fontFamily: `'${f.name}', sans-serif`, fontWeight: 700 }}
                                    className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white truncate tracking-normal"
                                  >
                                    {previewText || 'เป็นมนุษย์สุดประเสริฐเลิศคุณค่า'}
                                  </p>
                                </div>
                              </div>

                              {/* Styles List Container with Taller Fade Effect */}
                              <div className="relative">
                                <div
                                  className={`border-t border-zinc-100 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/50 dark:bg-[#16171d]/50 transition-all ${
                                    !isExpanded && hasMore
                                      ? '[mask-image:linear-gradient(to_bottom,black_15%,rgba(0,0,0,0.5)_50%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_15%,rgba(0,0,0,0.5)_50%,transparent_92%)] pb-2'
                                      : ''
                                  }`}
                                >
                                  {visibleWeights.map((w) => {
                                    const isWSelected = (f.selectedWeights || []).includes(w);
                                    const label = weightLabels[w] || `Weight ${w}`;

                                    return (
                                      <div
                                        key={w}
                                        className="px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-[#1e2028]/60 transition-colors"
                                      >
                                        <div>
                                          {/* Style label rendered with exact font-weight of this style */}
                                          <span
                                            style={{
                                              fontFamily: `'${f.name}', sans-serif`,
                                              fontWeight: w,
                                            }}
                                            className="text-sm sm:text-base text-zinc-800 dark:text-zinc-100 tracking-normal"
                                          >
                                            {label}
                                          </span>
                                        </div>

                                        {/* Google Fonts Style iOS Toggle Switch */}
                                        <button
                                          type="button"
                                          role="switch"
                                          aria-checked={isWSelected}
                                          onClick={() => toggleWeight(f.id, w)}
                                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                                            isWSelected ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
                                          }`}
                                        >
                                          <span
                                            className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                              isWSelected ? 'translate-x-5' : 'translate-x-0.5'
                                            } my-auto`}
                                          >
                                            {isWSelected && (
                                              <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                                            )}
                                          </span>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Expand / Collapse Styles Button */}
                                {hasMore && (
                                  <div className="p-3 bg-zinc-50/50 dark:bg-[#111216] text-center relative z-10">
                                    <button
                                      onClick={() => toggleExpand(f.id)}
                                      className="w-full py-1.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#1e2028] hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp className="w-3.5 h-3.5" />
                                          <span>Collapse styles</span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="w-3.5 h-3.5" />
                                          <span>Change styles ({f.weights.length} styles)</span>
                                        </>
                                      )}
                                    </button>
                                    <span className="text-[10px] text-zinc-400 mt-1 block">
                                      {f.selectedWeights?.length || 0} จาก {f.weights.length} styles ที่เลือก
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </motion.div>
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}
