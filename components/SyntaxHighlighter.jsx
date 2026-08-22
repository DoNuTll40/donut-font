'use client';

import React from 'react';

/**
 * Adaptive Syntax Highlighter for HTML (<link>), CSS (@import), CSS rules, and @font-face
 * Fully supports Light Mode and Dark Mode theme styling
 */
export default function SyntaxHighlighter({ code, language = 'css' }) {
  if (!code) return null;

  // Highlight HTML (<link rel="..." href="...">)
  if (language === 'html' || code.startsWith('<link')) {
    const lines = code.split('\n');
    return (
      <code className="font-mono text-xs leading-relaxed block">
        {lines.map((line, lineIdx) => {
          const parts = [];
          const regex = /(<\/?[a-zA-Z0-9]+)|([a-zA-Z-]+)=("[^"]*"|'[^']*')|([>])/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
              parts.push({ text: line.substring(lastIndex, match.index), type: 'plain' });
            }

            if (match[1]) {
              parts.push({ text: match[1], type: 'tag' });
            } else if (match[2] && match[3]) {
              parts.push({ text: match[2] + '=', type: 'attr' });
              parts.push({ text: match[3], type: 'string' });
            } else if (match[4]) {
              parts.push({ text: match[4], type: 'tag' });
            }
            lastIndex = regex.lastIndex;
          }

          if (lastIndex < line.length) {
            parts.push({ text: line.substring(lastIndex), type: 'plain' });
          }

          return (
            <span key={lineIdx} className="block">
              {parts.map((p, pIdx) => {
                if (p.type === 'tag') {
                  return <span key={pIdx} className="text-pink-600 dark:text-pink-400 font-semibold">{p.text}</span>;
                }
                if (p.type === 'attr') {
                  return <span key={pIdx} className="text-blue-600 dark:text-sky-400">{p.text}</span>;
                }
                if (p.type === 'string') {
                  return <span key={pIdx} className="text-emerald-700 dark:text-emerald-300 font-medium">{p.text}</span>;
                }
                return <span key={pIdx} className="text-zinc-700 dark:text-zinc-300">{p.text}</span>;
              })}
            </span>
          );
        })}
      </code>
    );
  }

  // Highlight CSS @import
  if (code.startsWith('@import')) {
    const importRegex = /(@import)(\s+)(url\()(['"][^'"]*['"])(\);)/;
    const match = code.match(importRegex);

    if (match) {
      return (
        <code className="font-mono text-xs leading-relaxed block break-all">
          <span className="text-purple-600 dark:text-purple-400 font-bold">{match[1]}</span>
          <span>{match[2]}</span>
          <span className="text-blue-600 dark:text-sky-400 font-semibold">{match[3]}</span>
          <span className="text-emerald-700 dark:text-emerald-300 font-medium">{match[4]}</span>
          <span className="text-blue-600 dark:text-sky-400 font-semibold">{match[5]}</span>
        </code>
      );
    }
  }

  // Highlight CSS Rules or multi-line CSS (@font-face, font-family, etc.)
  const lines = code.split('\n');
  return (
    <code className="font-mono text-xs leading-relaxed block">
      {lines.map((line, lIdx) => {
        // Comment
        if (line.trim().startsWith('/*')) {
          return (
            <span key={lIdx} className="block text-zinc-400 dark:text-zinc-500 italic">
              {line}
            </span>
          );
        }

        // @font-face header or braces
        if (line.includes('@font-face') || line.trim() === '{' || line.trim() === '}') {
          return (
            <span key={lIdx} className="block">
              {line.replace('@font-face', '###FF###').split('###FF###').map((seg, sIdx, arr) => (
                <React.Fragment key={sIdx}>
                  <span className="text-zinc-700 dark:text-zinc-300">{seg}</span>
                  {sIdx < arr.length - 1 && <span className="text-purple-600 dark:text-purple-400 font-bold">@font-face</span>}
                </React.Fragment>
              ))}
            </span>
          );
        }

        // Property: Value line
        const parts = [];
        const ruleRegex = /([a-zA-Z-]+:)|('([^']*)'|"([^"]*)")|(url\([^)]+\))|(format\([^)]+\))|(U\+[a-zA-Z0-9-, ]+)/g;
        let lastIndex = 0;
        let match;

        while ((match = ruleRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ text: line.substring(lastIndex, match.index), type: 'plain' });
          }
          if (match[1]) {
            parts.push({ text: match[1], type: 'prop' });
          } else if (match[2]) {
            parts.push({ text: match[2], type: 'string' });
          } else if (match[5]) {
            parts.push({ text: match[5], type: 'url' });
          } else if (match[6]) {
            parts.push({ text: match[6], type: 'format' });
          } else if (match[7]) {
            parts.push({ text: match[7], type: 'range' });
          }
          lastIndex = ruleRegex.lastIndex;
        }

        if (lastIndex < line.length) {
          parts.push({ text: line.substring(lastIndex), type: 'plain' });
        }

        return (
          <span key={lIdx} className="block">
            {parts.map((p, pIdx) => {
              if (p.type === 'prop') {
                return <span key={pIdx} className="text-blue-600 dark:text-sky-400 font-semibold">{p.text}</span>;
              }
              if (p.type === 'string') {
                return <span key={pIdx} className="text-emerald-700 dark:text-emerald-300 font-medium">{p.text}</span>;
              }
              if (p.type === 'url') {
                return <span key={pIdx} className="text-amber-600 dark:text-amber-300">{p.text}</span>;
              }
              if (p.type === 'format') {
                return <span key={pIdx} className="text-indigo-600 dark:text-indigo-400 font-medium">{p.text}</span>;
              }
              if (p.type === 'range') {
                return <span key={pIdx} className="text-pink-600 dark:text-pink-300 font-mono">{p.text}</span>;
              }
              return <span key={pIdx} className="text-zinc-700 dark:text-zinc-300">{p.text}</span>;
            })}
          </span>
        );
      })}
    </code>
  );
}
