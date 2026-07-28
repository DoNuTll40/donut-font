'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FolderPlus, CheckCircle2, AlertCircle, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FontUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setStatusMessage(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('fonts', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatusMessage({ type: 'success', text: `อัปโหลดฟอนต์ใหม่ ${data.files.length} ไฟล์สำเร็จแล้ว!` });
        setSelectedFiles([]);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'เกิดข้อผิดพลาดในการอัปโหลด' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์อัปโหลดได้' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                  Upload Fonts to Private Vault
                </h3>
                <p className="text-xs text-zinc-500">
                  อัปโหลดไฟล์ฟอนต์ (.woff2, .ttf, .otf) เข้าสู่ public/fonts/
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 rounded-2xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/40 transition-colors relative">
            <input
              type="file"
              multiple
              accept=".woff2,.ttf,.otf,.woff"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              คลิกหรือลากไฟล์ฟอนต์มาวางที่นี่
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              รองรับไฟล์ .woff2, .ttf, .otf ทุกระดับความหนาและสไตล์
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-none">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                ไฟล์ที่เลือก ({selectedFiles.length})
              </span>
              <div className="space-y-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileType className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ยกเลิก
            </button>

            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                selectedFiles.length > 0 && !uploading
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {uploading ? 'กำลังอัปโหลด...' : 'เริ่มอัปโหลดเข้า Vault'}
            </button>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
