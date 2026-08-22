'use client';

import React, { useState, useEffect } from 'react';
import HeroHeader from '../components/HeroHeader';
import ControlsBar from '../components/ControlsBar';
import FontCard from '../components/FontCard';
import { AlertCircle } from 'lucide-react';
import { useFontContext } from '../context/FontContext';

export default function Home() {
  const { previewText, setPreviewText } = useFontContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [fontSize, setFontSize] = useState(36);
  const [viewMode, setViewMode] = useState('grid');
  const [isGlobalItalic, setIsGlobalItalic] = useState(false);
  const [combinedCatalog, setCombinedCatalog] = useState([]);

  const fetchFonts = () => {
    fetch('/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (data.families) {
          setCombinedCatalog(data.families);
        }
      })
      .catch(err => console.log('Error fetching /api/fonts:', err));
  };

  useEffect(() => {
    fetchFonts();

    const handleUpdate = () => fetchFonts();
    window.addEventListener('tfv_font_updated', handleUpdate);
    return () => window.removeEventListener('tfv_font_updated', handleUpdate);
  }, []);

  const categories = ['All', 'Thai Loop', 'Thai Sans', 'Display', 'Handwriting'];

  const filteredFonts = combinedCatalog.filter((font) => {
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          font.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          font.designer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen pb-24 bg-zinc-50 dark:bg-[#0c0d0e] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Bento Hero Section */}
      <HeroHeader />

      {/* Sticky Bento Controls Bar */}
      <ControlsBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        previewText={previewText}
        setPreviewText={setPreviewText}
        fontSize={fontSize}
        setFontSize={setFontSize}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categories={categories}
        isGlobalItalic={isGlobalItalic}
        setIsGlobalItalic={setIsGlobalItalic}
      />

      {/* Font Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <h2 className="font-extrabold text-xl text-zinc-900 dark:text-white tracking-tight">
              Uploaded Private Web Fonts
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-[#15171c] border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
              {filteredFonts.length} families
            </span>
          </div>
        </div>

        {filteredFonts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#15171c] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-base">
              ยังไม่มีฟอนต์ที่อัปโหลดในระบบ
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              ฟอนต์ทั้งหมดจะแสดงผลเฉพาะไฟล์ที่คุณอัปโหลดไว้ในระบบ Private Vault (Neon DB) คลิกปุ่มตั้งค่าเพื่อเริ่มอัปโหลดฟอนต์ของคุณ
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'
                : 'flex flex-col gap-4'
            }
          >
            {filteredFonts.map((font) => (
              <FontCard
                key={font.id}
                font={font}
                previewText={previewText}
                fontSize={fontSize}
                viewMode={viewMode}
                isGlobalItalic={isGlobalItalic}
              />
            ))}
          </div>
        )}

      </div>

    </main>
  );
}
