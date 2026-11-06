import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '../data/i18n';
import { useSpeechSynthesis, type SpeechStatus } from '../hooks/useSpeechSynthesis';

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
  readPage: () => void;
  speechStatus: SpeechStatus;
  speechError: string | null;
  speechSupported: boolean;
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

function getReadablePageText(locale: Locale) {
  const main = document.getElementById('main-content');
  if (!main) return '';
  const content = main.cloneNode(true) as HTMLElement;
  content.querySelectorAll('button, input, select, textarea, video, audio, canvas, svg, script, style, [aria-hidden="true"], [role="status"], [data-read-exclude], .sr-only')
    .forEach((node) => node.remove());
  const text = (content.innerText || content.textContent || '').replace(/\s+/gu, ' ').trim();
  if (text.length <= 16_000) return text;
  const end = text.lastIndexOf('. ', 16_000);
  const excerpt = text.slice(0, end > 12_000 ? end + 1 : 16_000);
  return `${excerpt} ${locale === 'pt' ? 'Leitura abreviada. Use Ler descrição para ouvir uma seção específica.' : 'Reading shortened. Use Read description to hear a specific section.'}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);
  const [volume, setVolumeState] = useState(getInitialVolume);
  const [announcement, setAnnouncement] = useState('');
  const speech = useSpeechSynthesis(locale, volume);

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

  const setLocale = useCallback((next: Locale) => {
    if (next !== locale) speech.stop();
    setLocaleState(next);
  }, [locale, speech.stop]);
  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => setSettings((current) => ({ ...current, [key]: value })), []);
  const readPage = useCallback(() => {
    window.dispatchEvent(new CustomEvent('earthsound:before-read-page'));
    const text = getReadablePageText(locale);
    if (text) speech.speak(text);
  }, [locale, speech.speak]);

  const value = useMemo<AppContextValue>(() => ({
    locale, setLocale, settings, updateSetting, volume, setVolume, announce, announcement,
    speak: speech.speak, readPage, speechStatus: speech.status, speechError: speech.error, speechSupported: speech.supported,
    pauseSpeech: speech.pause, resumeSpeech: speech.resume, stopSpeech: speech.stop,
  }), [locale, setLocale, settings, updateSetting, volume, setVolume, announce, announcement, speech.speak, readPage, speech.status, speech.error, speech.supported, speech.pause, speech.resume, speech.stop]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
