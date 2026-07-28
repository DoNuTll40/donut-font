'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Server, Download, Layers } from 'lucide-react';

export default function HeroHeader() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 py-12 transition-colors">
      
      {/* Background ambient glow effect */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-3xl space-y-4"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold tracking-wide">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>Private Web Font CDN &amp; Asset Vault</span>
          </div>

          {/* Main Title */}
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900 dark:text-white leading-tight">
            คลังฟอนต์ไทยส่วนตัว สไตล์ Google Fonts
          </h1>

          {/* Description Purpose */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            รวบรวมฟอนต์ที่คุณซื้อมา เสิร์ฟผ่าน <strong>Serverless CDN API</strong> เพื่อให้นำไปใช้งานข้ามโดเมนในทุกโปรเจกต์ของคุณได้อย่างอิสระ เพียงแค่วาง URL <code>@import</code> หรือ <code>&lt;link&gt;</code> พร้อมระบบแปลงดาวน์โหลดไฟล์ <strong>.TTF / .ZIP</strong> เพื่อนำไปติดตั้งลง Windows ได้ในคลิกเดียว
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>CORS Unlocked (*)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <Server className="w-3.5 h-3.5 text-blue-500" />
              <span>Google Fonts CSS2 Format</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Windows .TTF / .ZIP Downloads</span>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
