import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Accessibility, AudioLines, ChevronDown, Home, Languages, Mic, MicOff, X } from 'lucide-react';
import { copy, type Locale } from '../data/i18n';
import { useApp } from '../context/AppContext';
import { primeAudioContext } from '../hooks/useSonification';

type VoiceState = 'off' | 'waiting' | 'listening' | 'understood' | 'unknown' | 'unsupported' | 'permission';
type SpeechRecognitionLike = EarthSoundSpeechRecognition;

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[?!.,]/g, '').trim();
}
function identifyCommand(transcript: string, locale: Locale): { action: string; value?: string } | null {
  const text = normalize(transcript);
  const contains = (...phrases: string[]) => phrases.some((phrase) => text.includes(normalize(phrase)));
  if (contains('abrir início', 'abrir inicio', 'open home', 'go home')) return { action: 'home' };
  if (contains('começar exploração', 'comecar exploracao', 'start exploration', 'start exploring')) return { action: 'catalog' };
  if (contains('abrir temperatura', 'open temperature', 'open temperature explorer')) return { action: 'temperature' };
  if (contains('explorar região fria', 'explorar regiao fria', 'explore cold region', 'explore the cold region')) return { action: 'cold' };
  if (contains('explorar região quente', 'explorar regiao quente', 'explore warm region', 'explore the warm region')) return { action: 'warm' };
  if (contains('ouvir dados', 'play data', 'listen to data', 'play the data')) return { action: 'play' };
  if (contains('pausar áudio', 'pausar audio', 'pause audio')) return { action: 'pause' };
  if (contains('retomar áudio', 'retomar audio', 'resume audio')) return { action: 'resume' };
  if (contains('parar áudio', 'parar audio', 'stop audio')) return { action: 'stop' };
  if (contains('abrir camada de ozônio', 'abrir camada de ozonio', 'open ozone layer', 'open ozone')) return { action: 'ozone' };
  if (contains('ler descrição', 'ler descricao', 'read description', 'read the description')) return { action: 'readDescription' };
  const spokenYear = text.match(/(?:selecionar ano|select year)\s*(1983|1988|1993|1998|2003|2008|2013|2018|mil novecentos e oitenta e tres|mil novecentos e oitenta e oito|mil novecentos e noventa e tres|mil novecentos e noventa e oito|dois mil e tres|dois mil e oito|dois mil e treze|dois mil e dezoito|nineteen eighty three|nineteen eighty eight|nineteen ninety three|nineteen ninety eight|two thousand three|two thousand eight|two thousand thirteen|two thousand eighteen)/);
  if (spokenYear) {
    const spokenValue = spokenYear[1];
    if (!spokenValue) return null;
    const numericYears: Record<string, string> = {
      'mil novecentos e oitenta e tres': '1983', 'mil novecentos e oitenta e oito': '1988',
      'mil novecentos e noventa e tres': '1993', 'mil novecentos e noventa e oito': '1998',
      'dois mil e tres': '2003', 'dois mil e oito': '2008', 'dois mil e treze': '2013', 'dois mil e dezoito': '2018',
      'nineteen eighty three': '1983', 'nineteen eighty eight': '1988', 'nineteen ninety three': '1993', 'nineteen ninety eight': '1998',
      'two thousand three': '2003', 'two thousand eight': '2008', 'two thousand thirteen': '2013', 'two thousand eighteen': '2018',
    };
    return { action: 'selectYear', value: numericYears[spokenValue] || spokenValue };
  }
  if (contains('aumentar volume', 'increase volume', 'turn volume up')) return { action: 'volumeUp' };
  if (contains('diminuir volume', 'decrease volume', 'turn volume down')) return { action: 'volumeDown' };
  if (contains('onde estou', 'where am i', 'where am I')) return { action: 'where' };
  if (contains('voltar', 'go back', 'back')) return { action: 'back' };
  if (contains('ajuda', 'help')) return { action: 'help' };
  if (locale === 'en' && /^2018$/.test(text)) return { action: 'selectYear', value: '2018' };
  return null;
}

function emit(action: string, value?: string | number) {
  window.dispatchEvent(new CustomEvent('earthsound:action', { detail: { action, value } }));
}

function VoiceControl() {
  const { locale, speak, announce } = useApp();
  const [state, setState] = useState<VoiceState>('off');
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const active = useRef(false);
  const ui = copy[locale];
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = Boolean(SpeechRecognitionCtor);
  const status = state === 'off' ? ui.voice.off
    : state === 'waiting' ? ui.voice.waiting
      : state === 'listening' ? ui.voice.listening
        : state === 'understood' ? ui.voice.understood
          : state === 'unknown' ? ui.voice.unknown
            : state === 'permission' ? ui.voice.permission : ui.voice.unsupported;

  useEffect(() => () => { active.current = false; recognition.current?.stop(); }, []);

  function stopListening() {
    active.current = false;
    recognition.current?.stop();
    recognition.current = null;
    setState('off');
    announce(ui.voice.off);
  }

  function startListening() {
    primeAudioContext();
    if (!SpeechRecognitionCtor) {
      setState('unsupported');
      const message = ui.voice.unsupported + (locale === 'pt' ? '. Todos os controles manuais continuam disponíveis.' : '. All manual controls remain available.');
      announce(message);
      return;
    }
    try {
      const instance = new SpeechRecognitionCtor();
      instance.lang = locale === 'pt' ? 'pt-BR' : 'en-US';
      instance.continuous = true;
      instance.interimResults = false;
      instance.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        if (!last || !last.isFinal) return;
        const transcript = last[0]?.transcript || '';
        const command = identifyCommand(transcript, locale);
        if (!command) {
          setState('unknown');
          const message = `${ui.voice.unknown}: ${transcript}`;
          announce(message);
          return;
        }
        setState('understood');
        const confirmation = locale === 'pt' ? `Comando reconhecido: ${transcript}` : `Command recognized: ${transcript}`;
        announce(confirmation);
        if (command.action === 'help') speak(ui.voice.commands);
        else speak(confirmation);
        emit(command.action, command.value);
      };
      instance.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          active.current = false;
          setState('permission');
          announce(ui.voice.permission);
        } else if (event.error === 'language-not-supported') {
          active.current = false;
          setState('unsupported');
          announce(ui.voice.unsupported);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setState('unknown');
          announce(ui.voice.unknown);
        }
      };
      instance.onend = () => {
        if (active.current) {
          setState('waiting');
          try { instance.start(); } catch { /* Some engines already restart recognition. */ }
        }
      };
      recognition.current = instance;
      active.current = true;
      setState('listening');
      announce(ui.voice.listening);
      instance.start();
    } catch {
      active.current = false;
      setState('unsupported');
      announce(ui.voice.unsupported);
    }
  }

  return (
    <div className="voice-control">
      <button type="button" className={`icon-button voice-button ${state === 'listening' ? 'is-listening' : ''}`} onClick={active.current ? stopListening : startListening} aria-label={active.current ? ui.voice.deactivate : ui.voice.activate} aria-pressed={active.current} title={active.current ? ui.voice.deactivate : ui.voice.activate}>
        {active.current ? <Mic size={18} aria-hidden="true" /> : supported ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
      </button>
      <span className={`voice-status voice-status-${state}`} role="status">{status}</span>
    </div>
  );
}

function AccessibilityPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, settings, updateSetting, volume, setVolume, speak, pauseSpeech, resumeSpeech, stopSpeech } = useApp();
  const ui = copy[locale];
  const access = ui.access;
  if (!open) return null;
  const say = locale === 'pt' ? 'Controles de acessibilidade. Use as opções de contraste, fonte, movimento, volume e leitura em voz alta.' : 'Accessibility controls. Use contrast, text size, motion, volume and read-aloud settings.';
  return (
    <div className="access-popover" id="access-popover" aria-labelledby="access-popover-title">
      <div className="popover-head"><div><span className="eyebrow">EARTHSOUND</span><h2 id="access-popover-title">{access.eyebrow}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label={ui.common.close}><X size={18} /></button></div>
      <label className="setting-row"><span>{access.contrast}</span><input type="checkbox" checked={settings.highContrast} onChange={(e) => updateSetting('highContrast', e.target.checked)} /></label>
      <label className="setting-row"><span>{access.largeText}</span><input type="checkbox" checked={settings.largeText} onChange={(e) => updateSetting('largeText', e.target.checked)} /></label>
      <label className="setting-row"><span>{access.reducedMotion}</span><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSetting('reducedMotion', e.target.checked)} /></label>
      <label className="range-setting"><span>{ui.common.volume}</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label={ui.common.volume} /></label>
      <div className="speech-tools"><button type="button" className="button button-small" onClick={() => speak(say)}>{access.startReading}</button><button type="button" className="button button-small" onClick={pauseSpeech}>{access.pauseReading}</button><button type="button" className="button button-small" onClick={resumeSpeech}>{access.resumeReading}</button><button type="button" className="button button-small button-quiet" onClick={stopSpeech}>{access.stopReading}</button></div>
      <Link className="popover-link" to="/acessibilidade" onClick={onClose}>{locale === 'pt' ? 'Abrir central de acessibilidade' : 'Open accessibility center'} <ChevronDown size={14} /></Link>
    </div>
  );
}

export function Shell() {
  const { locale, setLocale, announcement } = useApp();
  const [accessOpen, setAccessOpen] = useState(false);
  const ui = copy[locale];
  const location = useLocation();

  useEffect(() => { setAccessOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccessOpen(false);
        window.dispatchEvent(new CustomEvent('earthsound:action', { detail: { action: 'stop' } }));
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
          <span className="wordmark-symbol" aria-hidden="true"><span /><AudioLines size={15} /></span>
          <span className="wordmark-text"><strong>EarthSound</strong><small>{ui.brand.tagline}</small></span>
        </Link>
        <nav className="primary-nav" aria-label={locale === 'pt' ? 'Navegação principal' : 'Primary navigation'}>
          <NavLink to="/" end>{ui.nav.home}</NavLink>
          <NavLink to="/catalogo">{ui.nav.catalog}</NavLink>
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
      <div className="mobile-crumb"><Home size={14} aria-hidden="true" /><span>{ui.brand.label}</span><span className="crumb-dot">/</span><span>{location.pathname === '/' ? ui.nav.home : location.pathname === '/catalogo' ? ui.nav.catalog : location.pathname.includes('temperatura') ? ui.nav.temperature : location.pathname.includes('ozonio') ? ui.nav.ozone : ui.nav.accessibility}</span></div>
      <main id="main-content" className="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="wordmark-symbol small" aria-hidden="true"><span /><AudioLines size={12} /></span><strong>EarthSound</strong></div>
        <p>{ui.footer.about}</p>
        <a href="https://data.giss.nasa.gov/gistemp/" target="_blank" rel="noreferrer">{ui.footer.credits}</a>
        <button type="button" className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{ui.footer.top} ↑</button>
      </footer>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    </div>
  );
}
