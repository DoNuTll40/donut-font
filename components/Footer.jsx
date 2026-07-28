'use client';

import React from 'react';
import Link from 'next/link';
import { useFontContext } from '../context/FontContext';
import { Type, GitBranch, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { systemVersion } = useFontContext();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Type className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white">
                Thai Font Vault
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                {systemVersion}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Private Google Fonts-Compatible Web Font Engine &amp; Asset Vault for hosted Thai typography across all your web projects.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
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

          {/* Status Col */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              System Release
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <GitBranch className="w-3.5 h-3.5" />
                <span>{systemVersion} Stable (Git Ready)</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">
                Optimized Pure Node.js &amp; Next.js 15
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
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
