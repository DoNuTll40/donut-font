'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const FontContext = createContext();

export function FontProvider({ children }) {
  const [selectedFonts, setSelectedFonts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [systemVersion, setSystemVersion] = useState('v1.2.0');
  const [darkMode, setDarkMode] = useState(true);

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

  // Initialize theme mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const updateSystemVersion = (newVer) => {
    const formatted = newVer.startsWith('v') ? newVer : `v${newVer}`;
    setSystemVersion(formatted);
    localStorage.setItem('tfv_version', formatted);
  };

  const toggleSelectFont = (font, weight = 400) => {
    setSelectedFonts((prev) => {
      const exists = prev.find((f) => f.id === font.id);
      if (exists) {
        return prev.filter((f) => f.id !== font.id);
      } else {
        return [...prev, { ...font, selectedWeights: [weight] }];
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
          return { ...f, selectedWeights: newW.length > 0 ? newW : [weight] };
        }
        return f;
      })
    );
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
        removeFont,
        clearAllFonts,
        isDrawerOpen,
        setIsDrawerOpen,
        systemVersion,
        setSystemVersion: updateSystemVersion,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFontContext() {
  return useContext(FontContext);
}
