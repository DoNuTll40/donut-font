'use client';

import React, { useState } from 'react';
import { X, Wrench, Terminal, Check, Copy, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PythonGuideModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const commands = [
    {
      title: '1. Install Python Font Tools',
      cmd: 'pip install fonttools brotli',
      desc: 'Required libraries for WOFF2 decompression, table manipulation, and vertical metrics calculation.',
    },
    {
      title: '2. Extract Base64 Fonts from CSS',
      cmd: 'python scripts/repair_font.py extract input.css -o public/fonts/',
      desc: 'Scrapes data:application/font-woff2;base64 strings and decodes into .woff2 files inside public/fonts/.',
    },
    {
      title: '3. Repair Thai Vertical Metrics (OS/2 & hhea)',
      cmd: 'python scripts/repair_font.py fix custom_font.ttf -o public/fonts/fixed_font.woff2',
      desc: 'Adjusts sTypoAscender, usWinAscent, ascender, and sets fsSelection bit 7 (USE_TYPO_METRICS) to prevent tone mark clipping.',
    },
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                Python Font Repair & Scraping Guide
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automated Base64 extraction & Thai vertical metrics fix
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Why Fix Vertical Metrics? (ทำไมต้องแก้ OS/2 Table?)
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              เมื่อแปลงไฟล์เว็บฟอนต์จาก CSS (Base64 WOFF2) ต้นทางบางแห่งมักตัดตารางจัดหน้าส่งผลให้สระและวรรณยุกต์ไทยชี้สูงเกินขอบ เกิดปัญหา <strong>"สระจม/วรรณยุกต์ขอบขาด" (Tone mark clipping)</strong> สคริปต์ Python ของเราจะช่วยขยายระยะขอบบน-ล่างอัตโนมัติในตาราง <code>OS/2</code> และ <code>hhea</code>
            </p>
          </div>

          {/* Commands List */}
          <div className="space-y-4">
            {commands.map((c, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  {c.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</p>
                
                <div className="relative group">
                  <pre className="p-3.5 rounded-xl bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-gray-800">
                    {c.cmd}
                  </pre>
                  <button
                    onClick={() => handleCopy(c.cmd, idx)}
                    className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
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
            ))}
          </div>

          {/* Directory placement tip */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Target Font Storage Directory: <strong>public/fonts/</strong></span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>

        </div>

      </div>
    </div>
  );
}
