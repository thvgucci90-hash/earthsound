import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '../data/i18n';

export type AccessibilitySettings = { highContrast: boolean; largeText: boolean; reducedMotion: boolean };
type AppContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  announce: (message: string) => void;
  announcement: string;
  speak: (message: string) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
};
const defaultSettings: AccessibilitySettings = { highContrast: false, largeText: false, reducedMotion: false };
const AppContext = createContext<AppContextValue | null>(null);

function getInitialLocale(): Locale {
  try { return localStorage.getItem('earthsound-locale') === 'en' ? 'en' : 'pt'; } catch { return 'pt'; }
}
function getInitialSettings(): AccessibilitySettings {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('earthsound-accessibility') || '{}') as Partial<AccessibilitySettings> }; } catch { return defaultSettings; }
}
function getInitialVolume() {
  try { return Math.max(0, Math.min(1, Number(localStorage.getItem('earthsound-volume') ?? 0.55))); } catch { return 0.55; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);
  const [volume, setVolumeState] = useState(getInitialVolume);
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(message), 30);
  }, []);
  const setVolume = useCallback((value: number) => {
    const safe = Math.max(0, Math.min(1, value));
    setVolumeState(safe);
    try { localStorage.setItem('earthsound-volume', String(safe)); } catch { /* storage is optional */ }
    window.dispatchEvent(new CustomEvent('earthsound:volume', { detail: { volume: safe } }));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    document.documentElement.dataset.textSize = settings.largeText ? 'large' : 'normal';
    document.documentElement.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
    try { localStorage.setItem('earthsound-locale', locale); } catch { /* storage is optional */ }
    try { localStorage.setItem('earthsound-accessibility', JSON.stringify(settings)); } catch { /* storage is optional */ }
  }, [locale, settings]);

  useEffect(() => {
    const handleVolumeStep = (event: Event) => {
      const amount = (event as CustomEvent<{ amount: number }>).detail.amount;
      setVolume(volume + amount);
    };
    window.addEventListener('earthsound:volume-update', handleVolumeStep);
    return () => window.removeEventListener('earthsound:volume-update', handleVolumeStep);
  }, [volume, setVolume]);

  const speak = useCallback((message: string) => {
    announce(message);
    if (!('speechSynthesis' in window) || !message.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = locale === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 0.94;
    const voices = window.speechSynthesis.getVoices();
    const preferred = locale === 'pt' ? /^pt(-|_)?br/i : /^en(-|_)?us/i;
    const voice = voices.find((candidate) => preferred.test(candidate.lang)) || voices.find((candidate) => candidate.lang.toLowerCase().startsWith(locale));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }, [announce, locale]);
  const pauseSpeech = useCallback(() => { if ('speechSynthesis' in window) window.speechSynthesis.pause(); }, []);
  const resumeSpeech = useCallback(() => { if ('speechSynthesis' in window) window.speechSynthesis.resume(); }, []);
  const stopSpeech = useCallback(() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => setSettings((current) => ({ ...current, [key]: value })), []);

  const value = useMemo<AppContextValue>(() => ({ locale, setLocale, settings, updateSetting, volume, setVolume, announce, announcement, speak, pauseSpeech, resumeSpeech, stopSpeech }), [locale, setLocale, settings, updateSetting, volume, setVolume, announce, announcement, speak, pauseSpeech, resumeSpeech, stopSpeech]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
