'use client';

import React, { useState, useEffect } from 'react';
import { useFontContext } from '../context/FontContext';
import { X, Copy, Check, Trash2, Download, Package, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SelectedFontsDrawer() {
  const { isDrawerOpen, setIsDrawerOpen, selectedFonts, removeFont, toggleWeight, clearAllFonts } = useFontContext();
  const [activeTab, setActiveTab] = useState('link');
  const [copiedTab, setCopiedTab] = useState(null);

  // Prevent background body scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const familyParams = selectedFonts.map(f => {
    const sortedWeights = [...f.selectedWeights].sort((a, b) => a - b);
    const weightStr = sortedWeights.length > 0 ? `:wght@${sortedWeights.join(';')}` : '';
    return `family=${encodeURIComponent(f.name).replace(/%20/g, '+')}${weightStr}`;
  }).join('&');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';
  const apiUrl = `${originUrl}/api/css2?${familyParams}&display=swap`;

  const linkSnippet = `<link rel="preconnect" href="${originUrl}">\n<link rel="stylesheet" href="${apiUrl}">`;
  const importSnippet = `@import url('${apiUrl}');`;
  const cssRulesSnippet = selectedFonts.map(f => `font-family: '${f.name}', sans-serif;`).join('\n');

  const selectedFamilyNames = selectedFonts.map(f => f.name.replace(/\s+/g, '')).join(',');
  const zipDownloadAllUrl = `/api/download/zip?families=${encodeURIComponent(selectedFamilyNames)}`;

  const handleCopy = (text, tabName) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          
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
              className="w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                    Selected Fonts
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                    {selectedFonts.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {selectedFonts.length > 0 && (
                    <button
                      onClick={clearAllFonts}
                      className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
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
                    {/* 1-Click ZIP Download All Selected Fonts */}
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Download All (.ZIP for Windows)
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        ดาวน์โหลดฟอนต์ทั้ง {selectedFonts.length} ตระกูลที่เลือก เป็นไฟล์ .ZIP รวมฟอนต์ .TTF สำหรับติดตั้งลง Windows
                      </p>
                      <a
                        href={zipDownloadAllUrl}
                        download
                        className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download All Selected (.ZIP)</span>
                      </a>
                    </div>

                    {/* Selected Families List */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Selected Families &amp; Weights
                      </span>

                      {selectedFonts.map((f) => (
                        <div
                          key={f.id}
                          className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/60 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                                {f.name}
                              </h4>
                              <p className="text-xs text-zinc-500">{f.category}</p>
                            </div>
                            <button
                              onClick={() => removeFont(f.id)}
                              className="text-xs text-red-500 hover:text-red-600 font-semibold"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Weights pills */}
                          <div className="flex flex-wrap gap-1">
                            {f.weights.map((w) => {
                              const isWSelected = f.selectedWeights.includes(w);
                              return (
                                <button
                                  key={w}
                                  onClick={() => toggleWeight(f.id, w)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                                    isWSelected
                                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900'
                                  }`}
                                >
                                  {w} {isWSelected ? '✓' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Embed Code Section */}
                    <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Embed Code (Google Fonts API Format)
                        </span>
                      </div>

                      {/* Segmented Code Tabs */}
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => setActiveTab('link')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'link'
                              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          &lt;link&gt;
                        </button>
                        <button
                          onClick={() => setActiveTab('import')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'import'
                              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          @import
                        </button>
                        <button
                          onClick={() => setActiveTab('css')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'css'
                              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          CSS rules
                        </button>
                      </div>

                      {/* Clean Code Box */}
                      <div className="relative">
                        <pre className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 break-all whitespace-pre-wrap">
                          {activeTab === 'link' && linkSnippet}
                          {activeTab === 'import' && importSnippet}
                          {activeTab === 'css' && cssRulesSnippet}
                        </pre>

                        <button
                          onClick={() =>
                            handleCopy(
                              activeTab === 'link'
                                ? linkSnippet
                                : activeTab === 'import'
                                ? importSnippet
                                : cssRulesSnippet,
                              activeTab
                            )
                          }
                          className="mt-2.5 w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          {copiedTab === activeTab ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>คัดลอกเรียบร้อย!</span>
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
