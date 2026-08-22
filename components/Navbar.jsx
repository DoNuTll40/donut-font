'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFontContext } from '../context/FontContext';
import { Type, Code2, ShoppingBag, Moon, Sun, Settings } from 'lucide-react';
import PinAuthModal from './PinAuthModal';
import AdminSettingsModal from './AdminSettingsModal';

export default function Navbar() {
  const pathname = usePathname();
  const { darkMode, setDarkMode, selectedFonts, setIsDrawerOpen, systemVersion } = useFontContext();
  
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState('');

  const navLinks = [
    { href: '/', label: 'Font Catalog', icon: Type },
    { href: '/docs', label: 'CSS API (/api/css2)', icon: Code2 },
  ];

  const handlePinSuccess = (pin) => {
    setVerifiedPin(pin);
    setIsPinOpen(false);
    setIsAdminOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0c0d0e]/80 backdrop-blur-md transition-colors">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Thai Font Vault
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                  {systemVersion}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                Serverless Google Fonts API Engine
              </p>
            </div>
          </Link>

          {/* Navigation Links - Centered Absolutely */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-[#15171c] p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#1c1f26] text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Admin Settings & Upload Button (PIN Protected) */}
            <button
              onClick={() => setIsPinOpen(true)}
              className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-[#15171c] dark:hover:bg-[#1f222a] text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
              title="Admin Dashboard, Upload Fonts & Settings (PIN Required)"
            >
              <Settings className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            </button>

            {/* Modern Single-Click Theme Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-[#15171c] dark:hover:bg-[#1f222a] text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700 transition-transform rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Selected Fonts Drawer Pill */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              title="Open Selected Fonts Drawer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Get Fonts</span>
              {selectedFonts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-blue-600 font-extrabold text-[11px] flex items-center justify-center font-mono shadow-xs">
                  {selectedFonts.length}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* PIN Security Modal */}
      <PinAuthModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSuccess={handlePinSuccess}
        title="กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าสู่ระบบแอดมิน"
      />

      {/* Admin Settings & Deletion Dashboard */}
      <AdminSettingsModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        pinCode={verifiedPin}
        onSettingsChanged={() => {
          // Zero-reload update: dispatch custom event or refetch
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('tfv_font_updated'));
          }
        }}
      />
    </>
  );
}
