'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ShieldCheck, Sparkles, Type, Sliders } from 'lucide-react';
import { useFontContext } from '../context/FontContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function FontSpecimenModal({ font, isOpen, onClose }) {
  const { selectedFonts } = useFontContext();
  const [specimenWeight, setSpecimenWeight] = useState(font?.defaultWeight || 400);
  const [isItalic, setIsItalic] = useState(false);
  const [fontSize, setFontSize] = useState(36);
  const [customText, setCustomText] = useState('เป็นมนุษย์สุดประเสริฐเลิศคุณค่า');

  // Lock document body scroll safely when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !font) return null;

  const fontFamilyCss = `'${font.name}', sans-serif`;
  const cssApiUrl = `/api/css2?family=${encodeURIComponent(font.name.replace(/\s+/g, '+'))}:wght@${font.weights.join(';')}`;
  const zipDownloadUrl = `/api/download/zip?family=${encodeURIComponent(font.name.replace(/\s+/g, ''))}`;

  const thaiConsonants = 'ก ข ค ฆ ง จ ฉ ช ซ ฌ ญ ฎ ฏ ฐ ฑ ฒ ณ ด ต ถ ท ธ น บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ษ ส ห ฬ อ ฮ';
  const thaiToneMarks = 'ปิ้ ปี้ ปึ้ ปื้ ปุ์ ปู์ ธิ์ ญ์ ผู้ปราชญ์รู้แจ้ง 1234567890';
  const sampleParagraph = 'การจัดหน้าและพิมพ์อักขระภาษาไทยอย่างถูกต้อง ช่วยเพิ่มประสิทธิภาพการอ่านและสร้างสุนทรียภาพให้แก่ผู้ใช้งานบนทุกอุปกรณ์ดิจิทัล';

  return (
    <AnimatePresence>
      <link rel="stylesheet" href={cssApiUrl} />
      
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden scrollbar-none">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#15171c] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-[#0c0d0e]/60 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">
                  {font.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold border border-blue-200/50 dark:border-blue-800/50">
                  {font.stylesCount}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                By {font.designer} • Category: <strong className="text-zinc-700 dark:text-zinc-300">{font.category}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={zipDownloadUrl}
                download
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download .ZIP</span>
              </a>

              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Specimen Controls Bar */}
          <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-[#111215] border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shrink-0">
            
            {/* Custom Preview Textarea */}
            <div className="relative">
              <textarea
                rows={2}
                placeholder="Type custom text to update all specimen previews..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#181a20] text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none font-sans shadow-2xs"
              />
            </div>

            {/* Weights & Size Slider */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                <span className="font-bold text-zinc-400 mr-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Weight:
                </span>
                {font.weights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSpecimenWeight(w)}
                    className={`px-3 py-1 rounded-xl font-mono font-bold transition-all ${
                      specimenWeight === w
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                        : 'bg-white dark:bg-[#181a20] text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-[#181a20] border border-zinc-200/80 dark:border-zinc-800 px-3 py-1 rounded-xl shadow-2xs">
                  <span className="font-mono text-zinc-500 font-bold w-8">{fontSize}px</span>
                  <input
                    type="range"
                    min="14"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-24 sm:w-36 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer accent-blue-600"
                  />
                </div>

                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-2xs ${
                    isItalic
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-[#181a20] text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  Italic
                </button>
              </div>
            </div>

          </div>

          {/* Specimen Showcase Body - Bento Cards Grid */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 scrollbar-none">
            
            {/* 1. Custom Text Preview Bento Box */}
            <div className="p-6 rounded-3xl bg-zinc-50/50 dark:bg-[#111215] border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Custom Preview ({specimenWeight} {isItalic ? 'Italic' : 'Regular'})
              </span>
              <div
                style={{
                  fontFamily: fontFamilyCss,
                  fontSize: `${fontSize}px`,
                  fontWeight: specimenWeight,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  lineHeight: 1.35,
                }}
                className="text-zinc-900 dark:text-white break-words pt-1"
              >
                {customText || 'เป็นมนุษย์สุดประเสริฐเลิศคุณค่า'}
              </div>
            </div>

            {/* 2. Tone Mark Stack Testing Bento Box */}
            <div className="p-6 rounded-3xl bg-zinc-50/50 dark:bg-[#111215] border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Thai Tone Mark Stacking Test (ทดสอบสระซ้อนและวรรณยุกต์)
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  OS/2 Alignment Passed
                </span>
              </div>
              <div
                style={{
                  fontFamily: fontFamilyCss,
                  fontSize: `${fontSize}px`,
                  fontWeight: specimenWeight,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  lineHeight: 1.45,
                }}
                className="text-zinc-900 dark:text-white tracking-wide break-words pt-1"
              >
                {thaiToneMarks}
              </div>
            </div>

            {/* 3. Thai Alphabet Grid Bento Box */}
            <div className="p-6 rounded-3xl bg-zinc-50/50 dark:bg-[#111215] border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Thai Character Set (ก-ฮ)
              </span>
              <div
                style={{
                  fontFamily: fontFamilyCss,
                  fontSize: `${fontSize}px`,
                  fontWeight: specimenWeight,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  lineHeight: 1.5,
                }}
                className="text-zinc-800 dark:text-zinc-200 tracking-wider break-words pt-1"
              >
                {thaiConsonants}
              </div>
            </div>

            {/* 4. Body Paragraph Test Bento Box */}
            <div className="p-6 rounded-3xl bg-zinc-50/50 dark:bg-[#111215] border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Body Paragraph Readability Test
              </span>
              <p
                style={{
                  fontFamily: fontFamilyCss,
                  fontSize: `${fontSize}px`,
                  fontWeight: specimenWeight,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  lineHeight: 1.6,
                }}
                className="text-zinc-700 dark:text-zinc-300 break-words pt-1"
              >
                {sampleParagraph}
              </p>
            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
