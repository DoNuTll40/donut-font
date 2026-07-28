'use client';

import React, { useState } from 'react';
import { useFontContext } from '../context/FontContext';
import { Plus, Check, Download, Italic, Maximize2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
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

  const activeItalic = isGlobalItalic || isItalicMode;
  const isSelected = selectedFonts.some(f => f.id === font.id);

  const fontFamilyCss = `'${font.name}', sans-serif`;
  const cssApiUrl = `/api/css2?family=${encodeURIComponent(font.name.replace(/\s+/g, '+'))}:wght@${font.weights.join(';')}`;

  const zipDownloadUrl = `/api/download/zip?family=${encodeURIComponent(font.name.replace(/\s+/g, ''))}`;

  return (
    <>
      <link rel="stylesheet" href={cssApiUrl} />

      <div className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden">
        
        {/* Card Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {font.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {font.designer} • <span className="font-medium text-zinc-700 dark:text-zinc-300">{font.category}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSpecimenOpen(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold flex items-center gap-1"
                title="Open Full Font Specimen Modal"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Specimen</span>
              </button>
            </div>
          </div>

          {/* Weight Selectors Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* All Weights Wrap Neatly */}
              <div className="flex flex-wrap items-center gap-1">
                {font.weights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                      selectedWeight === w
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* Italic & Alignment Quick Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsItalicMode(!isItalicMode)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                    activeItalic
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title="Toggle Italic"
                >
                  <Italic className="w-3 h-3" />
                  <span>Italic</span>
                </button>

                {/* Alignment Switcher */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-1 rounded text-xs ${textAlign === 'left' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-400'}`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`p-1 rounded text-xs ${textAlign === 'center' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-400'}`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`p-1 rounded text-xs ${textAlign === 'right' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-400'}`}
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
        <div className="p-5 flex-1 flex items-center min-h-[120px]">
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
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
          
          {/* Download ZIP Package (.TTF for Windows) */}
          <a
            href={zipDownloadUrl}
            download
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all shadow-2xs"
            title={`Download all weights & styles of ${font.name} as ZIP (.TTF for Windows)`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All (.ZIP)</span>
          </a>

          {/* Select Font Button */}
          <button
            onClick={() => toggleSelectFont(font, selectedWeight)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs transition-all active:scale-95 shadow-xs ${
              isSelected
                ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                : 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
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
