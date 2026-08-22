'use client';

import React, { useState } from 'react';
import { useFontContext } from '../context/FontContext';
import { Plus, Check, Download, Italic, Maximize2, AlignLeft, AlignCenter, AlignRight, Loader2 } from 'lucide-react';
import FontSpecimenModal from './FontSpecimenModal';

export default function FontCard({
  font,
  previewText,
  fontSize,
  viewMode,
  isGlobalItalic,
}) {
  const { selectedFonts, toggleSelectFont } = useFontContext();
  const [selectedWeight, setSelectedWeight] = useState(font.defaultWeight || 400);
  const [isItalicMode, setIsItalicMode] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [isSpecimenOpen, setIsSpecimenOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeItalic = isGlobalItalic || isItalicMode;
  const isSelected = selectedFonts.some(f => f.id === font.id);

  const fontFamilyCss = `'${font.name}', sans-serif`;
  const cssApiUrl = `/api/css2?family=${encodeURIComponent(font.name.replace(/\s+/g, '+'))}:wght@${font.weights.join(';')}`;
  const zipDownloadUrl = `/api/download/zip?family=${encodeURIComponent(font.name.replace(/\s+/g, ''))}`;

  const handleDownloadZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch(zipDownloadUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${font.name.replace(/\s+/g, '_')}_Fonts.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดฟอนต์');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href={cssApiUrl} />

      <div className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-200 shadow-2xs hover:shadow-md overflow-hidden">
        
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/60 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {font.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-[#1c1f26] border border-zinc-200/60 dark:border-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  {font.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {font.designer} • {font.weights.length} Weights
              </p>
            </div>

            <button
              onClick={() => setIsSpecimenOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-50 dark:bg-[#1a1c23] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              title="Open Full Font Specimen Modal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Specimen</span>
            </button>
          </div>

          {/* Weight Selectors Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              
              {/* Weights Pills */}
              <div className="flex flex-wrap items-center gap-1">
                {font.weights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedWeight === w
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-[#1a1c23] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-800/60'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* Italic & Alignment Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsItalicMode(!isItalicMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeItalic
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-zinc-50 dark:bg-[#1a1c23] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/60 dark:border-zinc-800'
                  }`}
                  title="Toggle Italic"
                >
                  <Italic className="w-3 h-3" />
                  <span>Italic</span>
                </button>

                {/* Alignment Switcher */}
                <div className="flex items-center bg-zinc-50 dark:bg-[#1a1c23] p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-1 rounded-md text-xs ${textAlign === 'left' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-400'}`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`p-1 rounded-md text-xs ${textAlign === 'center' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-400'}`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`p-1 rounded-md text-xs ${textAlign === 'right' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-400'}`}
                    title="Align Right"
                  >
                    <AlignRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Text Preview Area */}
        <div className="p-5 sm:p-6 flex-1 flex items-center min-h-[130px] bg-zinc-50/30 dark:bg-[#121317]/50">
          <div
            style={{
              fontFamily: fontFamilyCss,
              fontSize: `${fontSize}px`,
              fontWeight: selectedWeight,
              fontStyle: activeItalic ? 'italic' : 'normal',
              textAlign: textAlign,
              lineHeight: 1.35,
            }}
            className="w-full text-zinc-900 dark:text-zinc-100 break-words tracking-normal transition-all"
          >
            {previewText || 'เป็นมนุษย์สุดประเสริฐเลิศคุณค่า'}
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-white dark:bg-[#15171c] border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
          
          {/* Download ZIP Package (.TTF for Windows) */}
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 disabled:opacity-75 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95"
            title={`Download all weights & styles of ${font.name} as ZIP (.TTF for Windows)`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังเตรียมไฟล์...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download All (.ZIP)</span>
              </>
            )}
          </button>

          {/* Select Font Button */}
          <button
            onClick={() => toggleSelectFont(font, selectedWeight)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-xs ${
              isSelected
                ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                : 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Get font</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Font Specimen Modal */}
      <FontSpecimenModal
        font={font}
        isOpen={isSpecimenOpen}
        onClose={() => setIsSpecimenOpen(false)}
      />
    </>
  );
}

