import { useState, useEffect } from 'react';
import { Theme } from '@/types';

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--tnt-bg': '#17212b',
    '--tnt-sidebar': '#232e3c',
    '--tnt-card': '#2b3a4a',
    '--tnt-input': '#1e2c3a',
    '--tnt-accent': '#2cb2e4',
    '--tnt-accent-hover': '#1a9fd3',
    '--tnt-text': '#ffffff',
    '--tnt-text-muted': '#8c9ab0',
    '--tnt-border': '#0d1117',
    '--tnt-msg-out': '#2b5278',
    '--tnt-msg-in': '#182533',
    '--tnt-online': '#3ba55c',
    '--tnt-read': '#4fc3f7',
  },
  light: {
    '--tnt-bg': '#f0f2f5',
    '--tnt-sidebar': '#ffffff',
    '--tnt-card': '#ffffff',
    '--tnt-input': '#f0f2f5',
    '--tnt-accent': '#2cb2e4',
    '--tnt-accent-hover': '#1a9fd3',
    '--tnt-text': '#000000',
    '--tnt-text-muted': '#707579',
    '--tnt-border': '#dfe1e5',
    '--tnt-msg-out': '#effdde',
    '--tnt-msg-in': '#ffffff',
    '--tnt-online': '#3ba55c',
    '--tnt-read': '#4fc3f7',
  },
  blue: {
    '--tnt-bg': '#1a1f2e',
    '--tnt-sidebar': '#1e2640',
    '--tnt-card': '#252d48',
    '--tnt-input': '#1a1f2e',
    '--tnt-accent': '#5865f2',
    '--tnt-accent-hover': '#4752c4',
    '--tnt-text': '#ffffff',
    '--tnt-text-muted': '#8e9297',
    '--tnt-border': '#0d1117',
    '--tnt-msg-out': '#3b4cca',
    '--tnt-msg-in': '#1e2640',
    '--tnt-online': '#3ba55c',
    '--tnt-read': '#a5b4fc',
  },
  green: {
    '--tnt-bg': '#0d1f13',
    '--tnt-sidebar': '#132219',
    '--tnt-card': '#1a2e21',
    '--tnt-input': '#0d1f13',
    '--tnt-accent': '#3ba55c',
    '--tnt-accent-hover': '#2d8246',
    '--tnt-text': '#ffffff',
    '--tnt-text-muted': '#7da98a',
    '--tnt-border': '#0a1a10',
    '--tnt-msg-out': '#1a5c2a',
    '--tnt-msg-in': '#132219',
    '--tnt-online': '#3ba55c',
    '--tnt-read': '#6ee7a0',
  },
  purple: {
    '--tnt-bg': '#1a0a2e',
    '--tnt-sidebar': '#22103c',
    '--tnt-card': '#2d1b4e',
    '--tnt-input': '#1a0a2e',
    '--tnt-accent': '#9c27b0',
    '--tnt-accent-hover': '#7b1fa2',
    '--tnt-text': '#ffffff',
    '--tnt-text-muted': '#b39ddb',
    '--tnt-border': '#0d0519',
    '--tnt-msg-out': '#6a1b9a',
    '--tnt-msg-in': '#22103c',
    '--tnt-online': '#3ba55c',
    '--tnt-read': '#ce93d8',
  },
  rose: {
    '--tnt-bg': '#1f0a14',
    '--tnt-sidebar': '#2e1220',
    '--tnt-card': '#3d1829',
    '--tnt-input': '#1f0a14',
    '--tnt-accent': '#e91e63',
    '--tnt-accent-hover': '#c2185b',
    '--tnt-text': '#ffffff',
    '--tnt-text-muted': '#f48fb1',
    '--tnt-border': '#140710',
    '--tnt-msg-out': '#880e4f',
    '--tnt-msg-in': '#2e1220',
    '--tnt-online': '#3ba55c',
    '--tnt-read': '#f48fb1',
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('tnt_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function applyTheme(t: Theme) {
    const vars = THEMES[t] || THEMES.dark;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }

  function setTheme(t: Theme) {
    localStorage.setItem('tnt_theme', t);
    setThemeState(t);
  }

  return { theme, setTheme, themes: Object.keys(THEMES) as Theme[] };
}
