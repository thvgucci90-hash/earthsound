import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Accessibility, ChevronDown, Home, Languages, Mic, MicOff, X } from 'lucide-react';
import { copy, type Locale } from '../data/i18n';
import { useApp } from '../context/AppContext';
import { primeAudioContext } from '../hooks/useSonification';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import type { SpeechStatus } from '../hooks/useSpeechSynthesis';
import { BrandMark } from './BrandMark';

function speechStatusLabel(locale: Locale, status: SpeechStatus) {
  const pt: Record<SpeechStatus, string> = { idle: 'Leitura parada', speaking: 'Lendo em voz alta', paused: 'Leitura pausada', unsupported: 'Leitura em voz alta indisponível neste navegador', error: 'A leitura encontrou um erro' };
  const en: Record<SpeechStatus, string> = { idle: 'Reading stopped', speaking: 'Reading aloud', paused: 'Reading paused', unsupported: 'Read-aloud is unavailable in this browser', error: 'Reading encountered an error' };
  return (locale === 'pt' ? pt : en)[status];
}

function VoiceControl() {
  const { locale, speak, announce, speechStatus } = useApp();
  const ui = copy[locale];
  const voice = useVoiceRecognition(locale, speechStatus, ui.voice, speak, announce);
  const status = !voice.supported || voice.state === 'unsupported' ? ui.voice.unsupported
    : voice.state === 'off' ? ui.voice.off
      : voice.state === 'waiting' ? ui.voice.waiting
      : voice.state === 'listening' ? ui.voice.listening
        : voice.state === 'understood' ? ui.voice.understood
          : voice.state === 'unknown' ? ui.voice.unknown
            : voice.state === 'permission' ? ui.voice.permission : ui.voice.unsupported;

  return (
    <div className="voice-control">
      <button type="button" className={`icon-button voice-button ${voice.state === 'listening' ? 'is-listening' : ''}`} onClick={() => { if (voice.active) voice.stop(); else { primeAudioContext(); voice.start(); } }} aria-label={voice.active ? ui.voice.deactivate : ui.voice.activate} aria-pressed={voice.active} title={voice.active ? ui.voice.deactivate : ui.voice.activate}>
        {voice.active ? <Mic size={18} aria-hidden="true" /> : voice.supported ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
      </button>
      <span className={`voice-status voice-status-${voice.state}`}>{status}</span>
      {(!voice.supported || voice.state === 'unsupported' || voice.state === 'permission') && <Link className="voice-fallback-link" to="/acessibilidade">{locale === 'pt' ? 'Comandos por texto' : 'Text commands'}</Link>}
    </div>
  );
}

function AccessibilityPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, settings, updateSetting, volume, setVolume, readPage, speechStatus, pauseSpeech, resumeSpeech, stopSpeech } = useApp();
  const ui = copy[locale];
  const access = ui.access;
  if (!open) return null;
  return (
    <div className="access-popover" id="access-popover" aria-labelledby="access-popover-title">
      <div className="popover-head"><div><span className="eyebrow">EARTHSOUND</span><h2 id="access-popover-title">{access.eyebrow}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label={ui.common.close}><X size={18} /></button></div>
      <label className="setting-row"><span>{access.contrast}</span><input type="checkbox" checked={settings.highContrast} onChange={(e) => updateSetting('highContrast', e.target.checked)} /></label>
      <label className="setting-row"><span>{access.largeText}</span><input type="checkbox" checked={settings.largeText} onChange={(e) => updateSetting('largeText', e.target.checked)} /></label>
      <label className="setting-row"><span>{access.reducedMotion}</span><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSetting('reducedMotion', e.target.checked)} /></label>
      <label className="range-setting"><span>{ui.common.volume}</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label={ui.common.volume} /></label>
      <div className="speech-tools"><button type="button" className="button button-small" onClick={readPage}>{access.startReading}</button><button type="button" className="button button-small" onClick={pauseSpeech} disabled={speechStatus !== 'speaking'}>{access.pauseReading}</button><button type="button" className="button button-small" onClick={resumeSpeech} disabled={speechStatus !== 'paused'}>{access.resumeReading}</button><button type="button" className="button button-small button-quiet" onClick={stopSpeech} disabled={speechStatus === 'idle'}>{access.stopReading}</button></div>
      <p className="speech-status-note">{speechStatusLabel(locale, speechStatus)}</p>
      <Link className="popover-link" to="/acessibilidade" onClick={onClose}>{locale === 'pt' ? 'Abrir central de acessibilidade' : 'Open accessibility center'} <ChevronDown size={14} /></Link>
    </div>
  );
}

export function Shell() {
  const { locale, setLocale, announcement, speechStatus } = useApp();
  const [accessOpen, setAccessOpen] = useState(false);
  const ui = copy[locale];
  const location = useLocation();

  useEffect(() => { setAccessOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccessOpen(false);
        window.dispatchEvent(new CustomEvent('earthsound:action', { detail: { action: 'stopAll' } }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{ui.nav.skip}</a>
      <header className="topbar">
        <Link to="/" className="wordmark" aria-label="EarthSound — início">
          <BrandMark className="brand-mark-image header-brand-mark" />
          <span className="wordmark-text"><strong>EarthSound</strong><small>{ui.brand.tagline}</small></span>
        </Link>
        <nav className="primary-nav" aria-label={locale === 'pt' ? 'Navegação principal' : 'Primary navigation'}>
          <NavLink to="/" end>{ui.nav.home}</NavLink>
          <NavLink to="/catalogo">{ui.nav.catalog}</NavLink>
          <NavLink to="/materiais">{locale === 'pt' ? 'Materiais NASA' : 'NASA media'}</NavLink>
          <NavLink to="/explorar/temperatura">{ui.nav.temperature}</NavLink>
          <NavLink to="/explorar/ozonio">{ui.nav.ozone}</NavLink>
        </nav>
        <div className="topbar-actions">
          <button type="button" className="language-switch" onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')} aria-label={locale === 'pt' ? 'Switch language to English' : 'Mudar idioma para português'} title={locale === 'pt' ? 'English' : 'Português'}><Languages size={16} aria-hidden="true" /><span>{locale === 'pt' ? 'PT' : 'EN'}</span></button>
          <VoiceControl />
          <button type="button" className={`access-trigger ${accessOpen ? 'active' : ''}`} onClick={() => setAccessOpen((current) => !current)} aria-expanded={accessOpen} aria-controls="access-popover"><Accessibility size={18} aria-hidden="true" /><span>{ui.nav.accessibility}</span></button>
        </div>
        <AccessibilityPanel open={accessOpen} onClose={() => setAccessOpen(false)} />
      </header>
      <div className="mobile-crumb"><Home size={14} aria-hidden="true" /><span>{ui.brand.label}</span><span className="crumb-dot">/</span><span>{location.pathname === '/' ? ui.nav.home : location.pathname === '/catalogo' ? ui.nav.catalog : location.pathname === '/materiais' ? (locale === 'pt' ? 'Materiais NASA' : 'NASA media') : location.pathname.includes('temperatura') ? ui.nav.temperature : location.pathname.includes('ozonio') ? ui.nav.ozone : ui.nav.accessibility}</span></div>
      <main id="main-content" className="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-brand"><BrandMark className="brand-mark-image footer-brand-mark" /><strong>EarthSound</strong></div>
        <p>{ui.footer.about}</p>
        <a href="https://data.giss.nasa.gov/gistemp/" target="_blank" rel="noreferrer">{ui.footer.credits}</a>
        <button type="button" className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{ui.footer.top} ↑</button>
        <span className="site-footer-watermark" aria-hidden="true"><BrandMark className="brand-mark-image" /></span>
      </footer>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{speechStatus === 'idle' ? '' : speechStatusLabel(locale, speechStatus)}</div>
    </div>
  );
}
