'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PinAuthModal({ isOpen, onClose, onSuccess, title = 'กรุณากรอกรหัส PIN 6 หลักเพื่อดำเนินการ' }) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Body scroll lock + Auto-Focus 1st input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPin(['', '', '', '', '', '']);
      setError(false);
      setErrorMessage('');

      setTimeout(() => {
        const firstInput = document.getElementById('pin-input-0');
        if (firstInput) firstInput.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    const char = value.substring(value.length - 1);
    newPin[index] = char;
    setPin(newPin);
    setError(false);

    if (char && index < 5) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto submit when 6th digit is entered
    const currentPinString = newPin.join('');
    if (currentPinString.length === 6) {
      verifyAndSubmit(currentPinString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyAndSubmit = (pinCode) => {
    if (pinCode === '001140') {
      onSuccess(pinCode);
    } else {
      setError(true);
      setErrorMessage('รหัส PIN ไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    verifyAndSubmit(pin.join(''));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-sm bg-white dark:bg-[#15171c] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-6 text-center"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
              Security PIN Required
            </h3>
            <p className="text-xs text-zinc-500">{title}</p>
          </div>

          {/* 6 Digit Input Boxes */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-input-${idx}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-10 h-12 text-center text-lg font-mono font-bold rounded-2xl border ${
                    error
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111215] text-zinc-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 shadow-2xs'
                  } focus:outline-none transition-all`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                ยืนยัน PIN
              </button>
            </div>
          </form>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
