'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Settings, HardDrive, RefreshCw, ChevronDown, ChevronUp, 
  CheckCircle2, AlertCircle, UploadCloud, Sliders, Database, ShieldCheck,
  Zap, Layers, Clock, Activity, ArrowUpRight, FolderGit2
} from 'lucide-react';
import { useFontContext } from '../context/FontContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettingsModal({ isOpen, onClose, pinCode, onSettingsChanged }) {
  const { systemVersion, setSystemVersion } = useFontContext();
  const [activeTab, setActiveTab] = useState('analytics'); // Default to 'analytics' to inspect DB
  const [familiesList, setFamiliesList] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [newVersionInput, setNewVersionInput] = useState(systemVersion);
  const [actionStatus, setActionStatus] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [loadingDbStats, setLoadingDbStats] = useState(false);

  // File Upload State
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Strict body & html scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchFontsList();
      fetchDbStats();
      setActionStatus(null);
      setNewVersionInput(systemVersion);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, systemVersion]);

  const fetchDbStats = async () => {
    setLoadingDbStats(true);
    try {
      const res = await fetch('/api/admin/db-stats');
      const data = await res.json();
      setDbStats(data);
    } catch (err) {
      console.error('Error fetching DB stats:', err);
    } finally {
      setLoadingDbStats(false);
    }
  };

  const fetchFontsList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fonts');
      const data = await res.json();
      if (data.families) {
        setFamiliesList(data.families);
        setTotalFiles(data.totalFiles);
      }
      if (data.version) {
        setSystemVersion(data.version);
      }
    } catch (err) {
      console.error('Error fetching font list:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleExpand = (familyId) => {
    setExpandedFamilies((prev) => ({ ...prev, [familyId]: !prev[familyId] }));
  };

  // Upload handler: Uploads files 1-by-1 to stay within Vercel's 4.5MB request payload limit
  const handleUpload = async () => {
    if (selectedUploadFiles.length === 0) return;

    const oversizedFiles = selectedUploadFiles.filter(f => f.size > 4.5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setActionStatus({
        type: 'error',
        text: `ไฟล์ ${oversizedFiles[0].name} ( ${(oversizedFiles[0].size / (1024 * 1024)).toFixed(2)} MB ) มีขนาดเกินโควตา 4.5 MB ของ Vercel Free Tier! กรุณาเลือกไฟล์ฟอนต์ที่มีขนาดไม่เกิน 4.5 MB`
      });
      return;
    }

    setUploading(true);
    setActionStatus(null);
    let successCount = 0;
    let failedFiles = [];

    for (let i = 0; i < selectedUploadFiles.length; i++) {
      const file = selectedUploadFiles[i];
      setUploadProgress(`กำลังอัปโหลด (${i + 1}/${selectedUploadFiles.length}): ${file.name}`);

      const formData = new FormData();
      formData.append('fonts', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            successCount++;
          } else {
            failedFiles.push(file.name);
          }
        } else {
          failedFiles.push(file.name);
        }
      } catch (err) {
        failedFiles.push(file.name);
      }
    }

    setUploading(false);
    setUploadProgress('');

    if (successCount > 0) {
      setActionStatus({
        type: 'success',
        text: `อัปโหลดฟอนต์เข้า Vault สำเร็จ ${successCount} จาก ${selectedUploadFiles.length} ไฟล์!`
      });
      setSelectedUploadFiles([]);
      fetchFontsList();
      fetchDbStats();
      if (onSettingsChanged) onSettingsChanged();
    } else {
      setActionStatus({
        type: 'error',
        text: `ไม่สามารถอัปโหลดไฟล์ได้ (${failedFiles.join(', ')})`
      });
    }
  };

  const handleDeleteFile = async (filename) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบไฟล์ ${filename} ออกจากระบบ?`)) return;

    try {
      const res = await fetch('/api/admin/fonts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-file',
          pin: pinCode,
          filename: filename,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setActionStatus({ type: 'success', text: data.message });
        fetchFontsList();
        fetchDbStats();
        if (onSettingsChanged) onSettingsChanged();
      } else {
        setActionStatus({ type: 'error', text: data.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบไฟล์' });
    }
  };

  const handleDeleteFamily = async (family) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบฟอนต์ตระกูล "${family.name}" (${family.files.length} ไฟล์) ออกจากระบบทั้งหมด?`)) return;

    try {
      const res = await fetch('/api/admin/fonts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-family',
          pin: pinCode,
          familyId: family.id,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setActionStatus({ type: 'success', text: data.message });
        fetchFontsList();
        fetchDbStats();
        if (onSettingsChanged) onSettingsChanged();
      } else {
        setActionStatus({ type: 'error', text: data.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบตระกูลฟอนต์' });
    }
  };

  const handleUpdateVersion = async () => {
    if (!newVersionInput) return;
    const formattedVer = newVersionInput.startsWith('v') ? newVersionInput : `v${newVersionInput}`;

    try {
      const res = await fetch('/api/admin/fonts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-version',
          pin: pinCode,
          newVersion: formattedVer,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setSystemVersion(data.version || formattedVer);
        setActionStatus({ type: 'success', text: `เปลี่ยนเวอร์ชันระบบเป็น ${data.version || formattedVer} สำเร็จเรียบร้อยแล้ว!` });
        if (onSettingsChanged) onSettingsChanged();
      } else {
        setActionStatus({ type: 'error', text: data.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปเดตเวอร์ชัน' });
    }
  };

  const navItems = [
    { id: 'analytics', label: 'Storage & Audit', icon: Database, desc: 'รายงานพื้นที่และสถานะ' },
    { id: 'manage', label: 'Manage & Delete', icon: HardDrive, desc: 'จัดการและลบฟอนต์' },
    { id: 'upload', label: 'Upload Fonts', icon: UploadCloud, desc: 'อัปโหลดฟอนต์เข้า Vault' },
    { id: 'system', label: 'System & Version', icon: Sliders, desc: 'ตั้งค่าและเวอร์ชันระบบ' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#111216] rounded-[28px] border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[88vh]"
        >
          {/* Sidebar Left */}
          <div className="w-full md:w-64 bg-zinc-50 dark:bg-[#0c0d0f] border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-zinc-800/80 p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              
              {/* Sidebar Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                    <Settings className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white tracking-tight">
                      Admin Settings
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      PIN Verified Session
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Nav Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-[#181a20] hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="leading-none whitespace-nowrap">{item.label}</div>
                        <div className={`text-[10px] mt-1 font-normal truncate ${isActive ? 'text-blue-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* Sidebar Bottom Info */}
            <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2 text-xs text-zinc-500 font-mono">
              <div className="flex items-center justify-between">
                <span>Database:</span>
                <span className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Neon Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Version:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{systemVersion}</span>
              </div>
            </div>
          </div>

          {/* Main Content Area Right */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#111216] overflow-hidden">
            
            {/* Content Top Bar */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#111216]/50">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                {navItems.find(i => i.id === activeTab)?.label}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl hover:bg-zinc-100 dark:hover:bg-[#1a1c22] transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Action Status Message */}
            {actionStatus && (
              <div
                className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  actionStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                }`}
              >
                {actionStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span className="leading-relaxed">{actionStatus.text}</span>
              </div>
            )}

            {/* Tab: Database Health & Storage Analytics (Bento Grid) */}
            {activeTab === 'analytics' && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-none">
                
                {/* 1. Live Database Connection Banner (Bento Box) */}
                <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3.5 w-3.5">
                      {dbStats?.status === 'connected' ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                          {dbStats?.provider || 'Neon Serverless PostgreSQL (Cloud)'}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {dbStats?.status === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                        Database: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{dbStats?.database || 'neondb'}</span> • {dbStats?.pgVersion || 'PostgreSQL'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 font-bold shadow-2xs">
                      <Activity className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span>{dbStats?.latencyMs || 0}ms Ping</span>
                    </span>
                    <button
                      onClick={fetchDbStats}
                      disabled={loadingDbStats}
                      className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl hover:bg-zinc-200/60 dark:hover:bg-[#1e2028] transition-colors"
                      title="Refresh Connection"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingDbStats ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2. Storage Quota & Usage Meter (Bento Box) */}
                <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        NEON DB STORAGE QUOTA (FREE TIER)
                      </span>
                      <h4 className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5 tracking-tight">
                        {dbStats?.storage?.usedFormatted || '0 MB'}{' '}
                        <span className="text-xs font-normal text-zinc-400">
                          / {dbStats?.storage?.totalQuotaFormatted || '512.0 MB (Neon Free Tier)'}
                        </span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {dbStats?.storage?.usagePercent || '0'}% ใช้ไปแล้ว
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        เหลืออีก {dbStats?.storage?.remainingFormatted || '512 MB'}
                      </p>
                    </div>
                  </div>

                  {/* Visual High-Def Progress Bar */}
                  <div className="w-full bg-zinc-200/80 dark:bg-[#0e0f13] h-3 rounded-full overflow-hidden p-0.5 border border-zinc-300/60 dark:border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(2, parseFloat(dbStats?.storage?.usagePercent || 0))}%` }}
                    />
                  </div>

                  {/* 4 Bento Sub-Grid Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">ขนาดที่ใช้จริง</span>
                      <div className="font-mono font-black text-sm text-zinc-900 dark:text-white mt-1">
                        {dbStats?.storage?.usedFormatted || '0 MB'}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">พื้นที่คงเหลือ</span>
                      <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        {dbStats?.storage?.remainingFormatted || '512 MB'}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">โควตาทั้งหมด</span>
                      <div className="font-mono font-black text-sm text-zinc-900 dark:text-white mt-1">
                        512.0 MB
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">รองรับได้อีกราวๆ</span>
                      <div className="font-mono font-black text-sm text-blue-600 dark:text-blue-400 mt-1">
                        ~{dbStats?.storage?.estimatedRemainingFiles?.toLocaleString() || '10,000'} ไฟล์
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Content Breakdown & Format Distribution (3 Bento Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] shadow-2xs">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">FONT FAMILIES</span>
                    <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                      {dbStats?.content?.totalFamilies || familiesList.length} ตระกูล
                    </h3>
                  </div>

                  <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] shadow-2xs">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">TOTAL FILES (DB)</span>
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {dbStats?.content?.totalFiles || totalFiles} ไฟล์
                    </h3>
                  </div>

                  <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] shadow-2xs">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">FORMATS DISTRIBUTION</span>
                    <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                      <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/60">
                        woff2: {dbStats?.content?.formats?.woff2 || 0}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-zinc-200 text-zinc-800 dark:bg-[#1e2028] dark:text-zinc-300 font-bold border border-zinc-300/60 dark:border-zinc-700/60">
                        ttf: {dbStats?.content?.formats?.truetype || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Latest Sync / Upload Activity (Bento Box) */}
                {dbStats?.content?.latestUpload && (
                  <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] space-y-1.5 text-xs shadow-2xs">
                    <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      ไฟล์ล่าสุดที่บันทึกใน Neon DB
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {dbStats.content.latestUpload.filename} ({dbStats.content.latestUpload.family_name})
                      </span>
                      <span className="font-mono text-zinc-400 text-[11px]">
                        ขนาด: {(dbStats.content.latestUpload.size_bytes / 1024).toFixed(1)} KB • {new Date(dbStats.content.latestUpload.created_at).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                )}

                {/* 5. Vercel & Production Readiness (Bento Box) */}
                <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#16171d] space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Cloud Architecture &amp; CDN Cache Status
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60">
                      <strong>CORS Header:</strong> <code>* (Cross-Origin Allowed)</code>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60">
                      <strong>Edge Caching:</strong> <code>1 Year Immutable</code>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60">
                      <strong>Storage Mode:</strong> <code>100% Serverless Neon DB</code>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1e2028] border border-zinc-200/60 dark:border-zinc-700/60">
                      <strong>Admin Access:</strong> <code>Protected (PIN Required)</code>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Manage & Delete Fonts */}
            {activeTab === 'manage' && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-none">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
                    <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                    Uploaded Font Families ({familiesList.length} ตระกูล / {totalFiles} ไฟล์)
                  </span>

                  <button
                    onClick={fetchFontsList}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                    title="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {familiesList.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-50 dark:bg-[#16171d] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500">
                    ไม่มีฟอนต์ในระบบ
                  </div>
                ) : (
                  <div className="space-y-3">
                    {familiesList.map((fam) => {
                      const isExpanded = expandedFamilies[fam.id];
                      const displayName = fam.name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ');

                      return (
                        <div
                          key={fam.id}
                          className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#16171d] overflow-hidden transition-all shadow-2xs"
                        >
                          <div className="p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-zinc-100/50 dark:bg-[#1e2028]/80">
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white truncate">
                                  {displayName}
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-mono font-bold whitespace-nowrap">
                                  {fam.files.length} ไฟล์
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-1 whitespace-nowrap">
                                {fam.category} • {fam.weights.length} Weights
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => toggleExpand(fam.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 whitespace-nowrap hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-2xs"
                              >
                                <span>รายละเอียด</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteFamily(fam)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs border border-red-500/20 transition-all whitespace-nowrap active:scale-95 shadow-2xs"
                                title="ลบฟอนต์ตระกูลนี้ทั้งหมด"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>ลบยกตระกูล</span>
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3.5 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2 bg-white dark:bg-[#111216]">
                              {fam.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-[#16171d] text-xs border border-zinc-100 dark:border-zinc-800/60">
                                  <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate pr-3">{file}</span>
                                  <button
                                    onClick={() => handleDeleteFile(file)}
                                    className="text-xs text-red-500 hover:text-red-600 hover:underline font-semibold whitespace-nowrap shrink-0"
                                  >
                                    ลบไฟล์นี้
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Upload Fonts */}
            {activeTab === 'upload' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    อัปโหลดไฟล์ฟอนต์เข้าสู่ Private Vault
                  </h4>
                  <p className="text-xs text-zinc-500">
                    อัปโหลดไฟล์ฟอนต์ <code>.woff2</code>, <code>.ttf</code>, <code>.otf</code> (จำกัดไม่เกิน 4.5 MB ต่อไฟล์ตามโควตา Vercel Free Tier)
                  </p>
                </div>

                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 rounded-3xl p-8 text-center bg-zinc-50/50 dark:bg-[#16171d] transition-colors relative">
                  <input
                    type="file"
                    multiple
                    accept=".woff2,.ttf,.otf,.woff"
                    onChange={(e) => {
                      if (e.target.files) setSelectedUploadFiles(Array.from(e.target.files));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                  <h5 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    คลิกหรือลากไฟล์ฟอนต์มาวางที่นี่
                  </h5>
                  <p className="text-xs text-zinc-400 mt-1">
                    รองรับไฟล์ .woff2, .ttf, .otf ทุกระดับความหนาและสไตล์
                  </p>
                </div>

                {selectedUploadFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      ไฟล์ที่เลือก ({selectedUploadFiles.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-none">
                      {selectedUploadFiles.map((file, idx) => {
                        const isTooLarge = file.size > 4.5 * 1024 * 1024;
                        return (
                          <div key={idx} className={`flex items-center justify-between p-2.5 rounded-2xl text-xs ${isTooLarge ? 'bg-red-500/10 border border-red-500/20' : 'bg-zinc-100 dark:bg-[#16171d]'}`}>
                            <span className={`font-mono truncate ${isTooLarge ? 'text-red-500 font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                              {file.name} {isTooLarge ? '(ขนาดใหญ่เกิน 4.5 MB)' : ''}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {uploadProgress && (
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {uploadProgress}
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={selectedUploadFiles.length === 0 || uploading}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-xs text-white transition-all shadow-xs ${
                      selectedUploadFiles.length > 0 && !uploading
                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {uploading ? 'กำลังอัปโหลด...' : 'เริ่มอัปโหลดเข้า Vault'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: System & Version Controller */}
            {activeTab === 'system' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
                <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#16171d] space-y-3 shadow-2xs">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    System Version Controller (ปัจจุบัน: {systemVersion})
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    แก้ไขและบันทึกเวอร์ชันระบบ ค่าจะถูกอัปเดตลง <code>data/version.json</code> และ <code>localStorage</code> ถาวร
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="v1.2.0"
                      value={newVersionInput}
                      onChange={(e) => setNewVersionInput(e.target.value)}
                      className="px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111216] text-zinc-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <button
                      onClick={handleUpdateVersion}
                      className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                    >
                      บันทึกเวอร์ชันใหม่
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
