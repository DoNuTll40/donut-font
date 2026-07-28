'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
// import { sampleTextPresets } from '../data/fontCatalog';
import { motion, AnimatePresence } from 'framer-motion';

export default function PresetDropdown({ setPreviewText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Presets ภาษาไทย');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (preset) => {
    setSelectedLabel(preset.label);
    setPreviewText(preset.text);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>

      {/* Custom Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs sm:text-sm font-medium flex items-center justify-between gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Animated Custom Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-full sm:w-64 z-50 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-1.5 space-y-1"
          >
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Presets ภาษาไทย</span>
            </div>

            {sampleTextPresets.map((preset, idx) => {
              const isSelected = selectedLabel === preset.label;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(preset)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  <span className="truncate">{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
