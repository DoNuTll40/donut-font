'use client';

import React from 'react';
import { Search, Grid, LayoutList, SlidersHorizontal, Italic } from 'lucide-react';
import PresetDropdown from './PresetDropdown';

export default function ControlsBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  previewText,
  setPreviewText,
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  categories,
  isGlobalItalic,
  setIsGlobalItalic,
}) {
  return (
    <div className="sticky top-16 z-30 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        
        {/* Top Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search fonts by name, designer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Custom Text Box */}
          <div className="md:col-span-5">
            <input
              type="text"
              placeholder="Type custom text to preview..."
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Custom Preset Dropdown */}
          <div className="md:col-span-3">
            <PresetDropdown setPreviewText={setPreviewText} />
          </div>

        </div>

        {/* Bottom Filters & Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/50">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-xs text-zinc-400 font-medium mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Category:
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Global Italic Toggle + Size Slider + View Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Global Italic Toggle */}
            <button
              onClick={() => setIsGlobalItalic(!isGlobalItalic)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isGlobalItalic
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Toggle Global Italic Font Style"
            >
              <Italic className="w-3.5 h-3.5" />
              <span>Italic All</span>
            </button>

            {/* Slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 w-9 text-right">
                {fontSize}px
              </span>
              <input
                type="range"
                min="14"
                max="96"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24 sm:w-32 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Row</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
