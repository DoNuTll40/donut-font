'use client';

import React, { useState } from 'react';
import { Code2, Server, Check, Copy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function ApiDocsView({ fontCatalog }) {
  const [selectedFamilies, setSelectedFamilies] = useState(['Prompt', 'Kanit']);
  const [display, setDisplay] = useState('swap');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [fetchedCss, setFetchedCss] = useState('');
  const [isLoadingCss, setIsLoadingCss] = useState(false);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';
  
  const familyParamsStr = selectedFamilies
    .map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;700`)
    .join('&');

  const fullApiUrl = `${originUrl}/api/css2?${familyParamsStr}&display=${display}`;

  const toggleFamily = (name) => {
    if (selectedFamilies.includes(name)) {
      if (selectedFamilies.length > 1) {
        setSelectedFamilies(selectedFamilies.filter(f => f !== name));
      }
    } else {
      setSelectedFamilies([...selectedFamilies, name]);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullApiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestFetchCss = async () => {
    setIsLoadingCss(true);
    try {
      const res = await fetch(fullApiUrl);
      const text = await res.text();
      setFetchedCss(text);
    } catch (err) {
      setFetchedCss(`/* Error fetching CSS: ${err.message} */`);
    } finally {
      setIsLoadingCss(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono text-xs font-semibold">
          <Server className="w-3.5 h-3.5" />
          Serverless Dynamic Font Generator
        </div>
        <h1 className="font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
          Google Fonts-Compatible CSS2 API Endpoint
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Serve repaired Thai fonts directly to any web application across domains with zero-CORS blocking and edge CDN caching.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">CORS Unlocked (*)</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Headers set to <code>Access-Control-Allow-Origin: *</code> allowing <code>@import</code> and <code>&lt;link&gt;</code> usage anywhere.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Dynamic URL Generator</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Accepts <code>?family=Name:wght@400;700</code> query params exactly like Google Fonts API v2.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Vercel & Edge CDN Cache</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Cache headers <code>s-maxage=86400, stale-while-revalidate</code> ensure lightning-fast font loading globally.
          </p>
        </div>
      </div>

      {/* Interactive API Tester */}
      <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6 shadow-sm">
        
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Interactive API Route Tester
            </h2>
            <p className="text-xs text-gray-500">
              Select families to test real-time CSS code generation
            </p>
          </div>
          <a
            href={fullApiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200 transition-colors"
          >
            <span>Open Endpoint in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Checkbox Family Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Select Test Font Families:
          </label>
          <div className="flex flex-wrap gap-2">
            {fontCatalog.map(f => {
              const isChecked = selectedFamilies.includes(f.name);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFamily(f.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isChecked
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {f.name} {isChecked ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live URL Output Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Generated API Endpoint Request URL:
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={fullApiUrl}
              className="w-full pl-4 pr-24 py-3 rounded-xl bg-gray-950 font-mono text-xs text-emerald-400 border border-gray-800 focus:outline-none"
            />
            <button
              onClick={handleCopyUrl}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 transition-all"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Execute Test Request */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleTestFetchCss}
            disabled={isLoadingCss}
            className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            <span>{isLoadingCss ? 'Fetching CSS...' : 'Test Fetch Live CSS Output'}</span>
          </button>

          {fetchedCss && (
            <div className="space-y-1 animate-fade-in">
              <span className="text-xs font-mono text-gray-400">Response Header: Content-Type: text/css; charset=utf-8</span>
              <pre className="p-4 rounded-xl bg-gray-950 text-gray-200 font-mono text-xs max-h-64 overflow-y-auto border border-gray-800 leading-relaxed">
                {fetchedCss}
              </pre>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
