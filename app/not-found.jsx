'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Code2, Type, ArrowLeft, Database, Search, ArrowRight, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
      
      {/* Top Bento Header Card (Same design language as Catalog and Docs) */}
      <div className="p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] shadow-xs relative overflow-hidden space-y-4">
        
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-mono text-xs font-bold border border-red-200/60 dark:border-red-800/60">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>HTTP 404 • Page Not Found</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight leading-tight">
            ไม่พบหน้าที่คุณค้นหา <span className="font-mono text-blue-600 dark:text-blue-400">(404)</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            หน้าเว็บหรือ Endpoint ที่คุณเรียกไม่มีอยู่ในระบบ Thai Font Vault กรุณาตรวจสอบ URL หรือเลือกเมนูด้านล่างเพื่อไปยังหน้าที่ต้องการ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้า Font Catalog</span>
          </Link>

          <Link
            href="/docs"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-[#1e2028] hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200/80 dark:border-zinc-700/80 transition-all active:scale-95"
          >
            <Code2 className="w-4 h-4 text-blue-500" />
            <span>คู่มือการใช้งาน CSS API</span>
          </Link>
        </div>

      </div>

      {/* Bento Grid 3 Quick Nav Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Box 1: Catalog */}
        <Link
          href="/"
          className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all group shadow-2xs space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Type className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Font Catalog
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              สำรวจ ทดสอบข้อความตัวอย่าง และเลือกฟอนต์ไทยที่คุณเป็นเจ้าของจาก Neon Cloud Vault
            </p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1">
            <span>ไปที่หน้า Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Box 2: CSS2 API Docs */}
        <Link
          href="/docs"
          className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all group shadow-2xs space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              CSS2 API Endpoint
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              ดูรูปแบบการส่ง Query Params, การตั้งค่า <code>font-display</code> และโค้ด Embed สำหรับเว็บของคุณ
            </p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 gap-1">
            <span>ไปที่หน้า API Docs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Box 3: Serverless Neon DB */}
        <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#15171c] shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-base">
              Private Cloud Storage
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              ระบบดึงฟอนต์ไบนารีจาก Neon PostgreSQL โดยตรง ไม่พึ่งพาไฟล์บนเครื่องเซิร์ฟเวอร์
            </p>
          </div>
          <div className="pt-2 flex items-center text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span>100% Serverless Node.js</span>
          </div>
        </div>

      </div>

    </div>
  );
}
