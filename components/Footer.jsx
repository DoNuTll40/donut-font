'use client';

import React from 'react';
import Link from 'next/link';
import { useFontContext } from '../context/FontContext';
import { Type, GitBranch, ShieldCheck, Database, Server } from 'lucide-react';

export default function Footer() {
  const { systemVersion } = useFontContext();

  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0d0e] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Footer Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Brand Col Bento Box */}
          <div className="md:col-span-6 p-6 rounded-3xl bg-zinc-50/60 dark:bg-[#15171c] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Type className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white">
                Thai Font Vault
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 text-[11px] font-mono font-bold">
                {systemVersion}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Private Google Fonts-Compatible Web Font Engine &amp; Asset Vault for hosted Thai typography across all your web projects.
            </p>
          </div>

          {/* Quick Links Bento Box */}
          <div className="md:col-span-3 p-6 rounded-3xl bg-zinc-50/60 dark:bg-[#15171c] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Font Catalog
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  CSS API (/api/css2)
                </Link>
              </li>
            </ul>
          </div>

          {/* Status Col Bento Box */}
          <div className="md:col-span-3 p-6 rounded-3xl bg-zinc-50/60 dark:bg-[#15171c] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              System Engine
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>Neon Cloud Database</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">
                Pure Serverless Node.js &amp; Next.js 15
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Thai Font Vault • Version {systemVersion}</p>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Git Repository Production Ready</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

