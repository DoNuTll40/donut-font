'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const FontContext = createContext();

export function FontProvider({ children }) {
  const [selectedFonts, setSelectedFonts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [systemVersion, setSystemVersion] = useState('v1.2.0');
  const [darkMode, setDarkMode] = useState(true);
  const [previewText, setPreviewText] = useState('เป็นมนุษย์สุดประเสริฐเลิศคุณค่า');

  // Fetch version on mount & sync with localStorage
  useEffect(() => {
    const savedVer = localStorage.getItem('tfv_version');
    if (savedVer) setSystemVersion(savedVer);

    fetch('/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (data.version) {
          setSystemVersion(data.version);
          localStorage.setItem('tfv_version', data.version);
        }
      })
      .catch(err => console.log('Checking version:', err));
  }, []);

  // Initialize theme mode with localStorage persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('tfv_theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const handleSetDarkMode = (val) => {
    setDarkMode(val);
    localStorage.setItem('tfv_theme', val ? 'dark' : 'light');
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  const toggleSelectFont = (font, weight = null) => {
    setSelectedFonts((prev) => {
      const exists = prev.find((f) => f.id === font.id);
      if (exists) {
        return prev.filter((f) => f.id !== font.id);
      } else {
        const allW = font.weights && font.weights.length > 0 ? [...font.weights] : [400];
        return [...prev, { ...font, selectedWeights: allW }];
      }
    });
    setIsDrawerOpen(true);
  };

  const toggleWeight = (fontId, weight) => {
    setSelectedFonts((prev) =>
      prev.map((f) => {
        if (f.id === fontId) {
          const currentW = f.selectedWeights || [];
          const hasW = currentW.includes(weight);
          const newW = hasW
            ? currentW.filter((w) => w !== weight)
            : [...currentW, weight];
          return { ...f, selectedWeights: newW };
        }
        return f;
      })
    );
  };

  const toggleAllWeights = (fontId) => {
    setSelectedFonts((prev) =>
      prev.map((f) => {
        if (f.id === fontId) {
          const isAllSelected = (f.selectedWeights || []).length === (f.weights || []).length;
          return {
            ...f,
            selectedWeights: isAllSelected ? [] : [...(f.weights || [])],
          };
        }
        return f;
      })
    );
  };

  const updateSystemVersion = (newVer) => {
    const formatted = newVer.startsWith('v') ? newVer : `v${newVer}`;
    setSystemVersion(formatted);
    localStorage.setItem('tfv_version', formatted);
  };

  const removeFont = (fontId) => {
    setSelectedFonts((prev) => prev.filter((f) => f.id !== fontId));
  };

  const clearAllFonts = () => {
    setSelectedFonts([]);
  };

  return (
    <FontContext.Provider
      value={{
        selectedFonts,
        toggleSelectFont,
        toggleWeight,
        toggleAllWeights,
        removeFont,
        clearAllFonts,
        isDrawerOpen,
        setIsDrawerOpen,
        systemVersion,
        setSystemVersion: updateSystemVersion,
        darkMode,
        setDarkMode: handleSetDarkMode,
        previewText,
        setPreviewText,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFontContext() {
  return useContext(FontContext);
}
