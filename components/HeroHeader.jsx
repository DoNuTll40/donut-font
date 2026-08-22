'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Server, Download, Database, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroHeader() {
  return (
    <section className="relative overflow-hidden py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Bento Card 1: Main Hero Banner (Col 8) with Animated Glowing Border */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-8 bento-glow-container shadow-xs group"
          >
            <div className="bento-glow-inner p-6 sm:p-8 bg-white dark:bg-[#15171c] flex flex-col justify-between relative overflow-hidden h-full">
              
              {/* Ambient subtle glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Private Web Font CDN Engine</span>
                </div>

                {/* Title */}
                <h1 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] tracking-tight text-zinc-900 dark:text-white leading-tight">
                  คลังฟอนต์ไทยส่วนตัว <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400">
                    Google Fonts CSS2 API
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                  รวบรวมฟอนต์ที่คุณเป็นเจ้าของ เสิร์ฟผ่าน <strong>Serverless Dynamic CSS API</strong> เพื่อใช้งานข้ามโดเมนได้ทันทีโดยไม่ติด CORS พร้อมตัวแปลงดาวน์โหลดไฟล์ <strong>.TTF / .ZIP</strong> ติดตั้งลง Windows ในคลิกเดียว
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-6 relative z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#1c1f26] border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>CORS Unlocked (*)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#1c1f26] border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Fonts Compatible</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#1c1f26] border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1-Click Windows .ZIP</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Bento Card 2: Cloud Vault Info (Col 4) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-4 p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Neon DB Active
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Serverless Cloud Storage
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  ไฟล์ฟอนต์ทั้งหมดถูกแปลงเป็น Binary Data เก็บลงฐานข้อมูล Neon Postgres ปลอดภัยและไร้ปัญหาขีดจำกัดเครื่องเซิร์ฟเวอร์
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                /api/css2 Ready
              </span>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>ดู API Docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

