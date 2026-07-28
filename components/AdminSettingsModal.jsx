'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Settings, HardDrive, RefreshCw, ChevronDown, ChevronUp, 
  CheckCircle2, AlertCircle, UploadCloud, FileType, Sliders, ShieldCheck, Database 
} from 'lucide-react';
import { useFontContext } from '../context/FontContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettingsModal({ isOpen, onClose, pinCode, onSettingsChanged }) {
  const { systemVersion, setSystemVersion } = useFontContext();
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'upload' | 'system' | 'analytics'
  const [familiesList, setFamiliesList] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [newVersionInput, setNewVersionInput] = useState(systemVersion);
  const [actionStatus, setActionStatus] = useState(null);

  // File Upload State
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Strict body & html scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      fetchFontsList();
      setActionStatus(null);
      setNewVersionInput(systemVersion);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, systemVersion]);

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

  const handleUpload = async () => {
    if (selectedUploadFiles.length === 0) return;

    setUploading(true);
    setActionStatus(null);

    const formData = new FormData();
    selectedUploadFiles.forEach((file) => {
      formData.append('fonts', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setActionStatus({ type: 'success', text: `อัปโหลดฟอนต์ใหม่ ${data.files.length} ไฟล์สำเร็จเรียบร้อย!` });
        setSelectedUploadFiles([]);
        fetchFontsList();
        if (onSettingsChanged) onSettingsChanged();
      } else {
        setActionStatus({ type: 'error', text: data.message || 'เกิดข้อผิดพลาดในการอัปโหลด' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์อัปโหลดได้' });
    } finally {
      setUploading(false);
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
          pin: pinCode || '001140',
          filename: filename,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setActionStatus({ type: 'success', text: data.message });
        fetchFontsList();
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
          pin: pinCode || '001140',
          familyId: family.id,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setActionStatus({ type: 'success', text: data.message });
        fetchFontsList();
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
          pin: pinCode || '001140',
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
    { id: 'manage', label: 'Manage & Delete', icon: HardDrive, desc: 'จัดการและลบฟอนต์' },
    { id: 'upload', label: 'Upload Fonts', icon: UploadCloud, desc: 'อัปโหลดฟอนต์เข้า Vault' },
    { id: 'system', label: 'System & Version', icon: Sliders, desc: 'ตั้งค่าและเวอร์ชันระบบ' },
    { id: 'analytics', label: 'Storage & Audit', icon: Database, desc: 'รายงานพื้นที่และสถานะ' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]"
        >
          {/* Sidebar Left */}
          <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-900/60 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              
              {/* Sidebar Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                    <Settings className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white tracking-tight">
                    Admin Settings
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-500 pl-10">
                  PIN Verified Session
                </p>
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
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="leading-none whitespace-nowrap">{item.label}</div>
                        <div className={`text-[10px] mt-1 font-normal truncate ${isActive ? 'text-blue-100' : 'text-zinc-400'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* Sidebar Bottom Info */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between font-mono">
              <span>Version:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{systemVersion}</span>
            </div>
          </div>

          {/* Main Content Area Right */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 overflow-hidden">
            
            {/* Content Top Bar */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                {navItems.find(i => i.id === activeTab)?.label}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Action Status Message */}
            {actionStatus && (
              <div
                className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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
                <span>{actionStatus.text}</span>
              </div>
            )}

            {/* Tab 1: Manage & Delete Fonts */}
            {activeTab === 'manage' && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-none">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
                    <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                    Uploaded Font Families ({familiesList.length} ตระกูล / {totalFiles} ไฟล์)
                  </span>

                  <button
                    onClick={fetchFontsList}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                    title="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {familiesList.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                    ไม่มีฟอนต์ในระบบ
                  </div>
                ) : (
                  <div className="space-y-3">
                    {familiesList.map((fam) => {
                      const isExpanded = expandedFamilies[fam.id];
                      // Clean formatted family name
                      const displayName = fam.name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ');

                      return (
                        <div
                          key={fam.id}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 overflow-hidden transition-all"
                        >
                          <div className="p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-zinc-100/50 dark:bg-zinc-900/80">
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
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 whitespace-nowrap hover:bg-zinc-50 dark:hover:bg-zinc-700"
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
                            <div className="p-3.5 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2 bg-white dark:bg-zinc-950">
                              {fam.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-xs">
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

            {/* Tab 2: Upload Fonts */}
            {activeTab === 'upload' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    อัปโหลดไฟล์ฟอนต์เข้าสู่ Private Vault
                  </h4>
                  <p className="text-xs text-zinc-500">
                    ไฟล์จะถูกจัดเก็บบนเซิร์ฟเวอร์ใน <code>public/fonts/</code> และเปิดให้ใช้งานผ่าน API ทันที
                  </p>
                </div>

                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 rounded-3xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/40 transition-colors relative">
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
                      {selectedUploadFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs">
                          <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate">{file.name}</span>
                          <span className="font-mono text-[10px] text-zinc-400 whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={selectedUploadFiles.length === 0 || uploading}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-xs ${
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

            {/* Tab 3: System & Version Controller */}
            {activeTab === 'system' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    System Version Controller (ปัจจุบัน: {systemVersion})
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    แก้ไขและบันทึกเวอร์ชันระบบ ค่าจะถูกอัปเดตลง <code>data/version.json</code> และ <code>package.json</code> ถาวร
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="v1.2.0"
                      value={newVersionInput}
                      onChange={(e) => setNewVersionInput(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <button
                      onClick={handleUpdateVersion}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                    >
                      บันทึกเวอร์ชันใหม่
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Storage Analytics */}
            {activeTab === 'analytics' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Total Families</span>
                    <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                      {familiesList.length}
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Total Files</span>
                    <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {totalFiles}
                    </h3>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Security &amp; API Status
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    CORS Header: <code>Access-Control-Allow-Origin: *</code> Active<br/>
                    PIN Protection: 6-Digit Security Code Active<br/>
                    Node.js Runtime Engine: Next.js 15 Serverless
                  </p>
                </div>
              </div>
            )}

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
