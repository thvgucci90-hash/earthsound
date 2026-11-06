import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '../data/i18n';
import type { SpeechStatus } from './useSpeechSynthesis';

export type VoiceState = 'off' | 'waiting' | 'listening' | 'understood' | 'unknown' | 'unsupported' | 'permission';
export type VoiceCommand = { action: string; value?: string };

type LocalizedVoiceText = {
  off: string; waiting: string; listening: string; understood: string; unknown: string;
  unsupported: string; permission: string; commands: string;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim();
}

export function identifyVoiceCommand(transcript: string): VoiceCommand | null {
  const text = normalize(transcript);
  const includes = (...phrases: string[]) => phrases.some((phrase) => ` ${text} `.includes(` ${normalize(phrase)} `));

  if (includes('abrir início', 'abrir inicio', 'open home', 'go home')) return { action: 'home' };
  if (includes('abrir materiais nasa', 'abrir biblioteca nasa', 'open nasa materials', 'open nasa media', 'open materials')) return { action: 'materials' };
  if (includes('começar exploração', 'comecar exploracao', 'start exploration', 'start exploring')) return { action: 'catalog' };
  if (includes('abrir temperatura', 'open temperature', 'open temperature explorer')) return { action: 'temperature' };
  if (includes('explorar região fria', 'explorar regiao fria', 'explore cold region', 'explore the cold region')) return { action: 'cold' };
  if (includes('explorar região quente', 'explorar regiao quente', 'explore warm region', 'explore the warm region')) return { action: 'warm' };
  if (includes('ouvir dados', 'play data', 'listen to data', 'play the data')) return { action: 'play' };
  if (includes('pausar leitura', 'pause reading', 'pause read aloud')) return { action: 'pauseRead' };
  if (includes('retomar leitura', 'resume reading', 'resume read aloud')) return { action: 'resumeRead' };
  if (includes('parar leitura', 'stop reading', 'stop read aloud')) return { action: 'stopRead' };
  if (includes('pausar áudio', 'pausar audio', 'pause audio')) return { action: 'pause' };
  if (includes('retomar áudio', 'retomar audio', 'resume audio')) return { action: 'resume' };
  if (includes('parar áudio', 'parar audio', 'stop audio')) return { action: 'stop' };
  if (includes('abrir camada de ozônio', 'abrir camada de ozonio', 'open ozone layer', 'open ozone')) return { action: 'ozone' };
  if (includes('ler descrição', 'ler descricao', 'read description', 'read the description')) return { action: 'readDescription' };
  if (includes('ler esta página', 'ler esta pagina', 'ler página', 'ler pagina', 'read this page', 'read page')) return { action: 'readPage' };

  const yearWords: Record<string, string> = {
    'mil novecentos e oitenta e tres': '1983', 'mil novecentos e oitenta e oito': '1988',
    'mil novecentos e noventa e tres': '1993', 'mil novecentos e noventa e oito': '1998',
    'dois mil e tres': '2003', 'dois mil e oito': '2008', 'dois mil e treze': '2013', 'dois mil e dezoito': '2018',
    'nineteen eighty three': '1983', 'nineteen eighty eight': '1988', 'nineteen ninety three': '1993', 'nineteen ninety eight': '1998',
    'two thousand three': '2003', 'two thousand eight': '2008', 'two thousand thirteen': '2013', 'two thousand eighteen': '2018',
  };
  const allowedYears = ['1983', '1988', '1993', '1998', '2003', '2008', '2013', '2018'];
  const yearPrefix = /(?:selecionar(?: o)? ano|select(?: the)? year)\s*(.*)$/u.exec(text);
  if (yearPrefix?.[1]) {
    const request = yearPrefix[1].trim();
    const numeric = allowedYears.find((year) => request === year || request.startsWith(year + ' '));
    if (numeric) return { action: 'selectYear', value: numeric };
    const spoken = Object.entries(yearWords).find(([words]) => request === words || request.startsWith(words + ' '));
    if (spoken) return { action: 'selectYear', value: spoken[1] };
  }

  if (includes('aumentar volume', 'increase volume', 'turn volume up')) return { action: 'volumeUp' };
  if (includes('diminuir volume', 'decrease volume', 'turn volume down')) return { action: 'volumeDown' };
  if (includes('onde estou', 'where am i')) return { action: 'where' };
  if (includes('voltar', 'go back', 'back')) return { action: 'back' };
  if (includes('ajuda', 'help')) return { action: 'help' };
  return null;
}

function getConstructor() {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export function useVoiceRecognition(locale: Locale, speechStatus: SpeechStatus, text: LocalizedVoiceText, speak: (message: string) => void, announce: (message: string) => void) {
  const [state, setState] = useState<VoiceState>('off');
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const recognitionRef = useRef<EarthSoundSpeechRecognition | null>(null);
  const restartTimerRef = useRef<number | undefined>(undefined);
  const lastHandledRef = useRef('');
  const listeningAnnouncedRef = useRef(false);
  const localeRef = useRef(locale);
  const Constructor = getConstructor();
  const supported = Boolean(Constructor);

  const stopRecognitionInstance = useCallback(() => {
    if (restartTimerRef.current !== undefined) window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = undefined;
    const instance = recognitionRef.current;
    recognitionRef.current = null;
    if (instance) {
      instance.onend = null;
      instance.onresult = null;
      instance.onerror = null;
      try { instance.stop(); } catch { /* It may already have stopped. */ }
    }
  }, []);

  const createRecognition = useCallback(() => {
    if (!activeRef.current || recognitionRef.current) return;
    const Recognition = getConstructor();
    if (!Recognition) {
      activeRef.current = false;
      setActive(false);
      setState('unsupported');
      announce(`${text.unsupported}. ${locale === 'pt' ? 'Use os controles convencionais.' : 'Use the regular controls.'}`);
      return;
    }

    let instance: EarthSoundSpeechRecognition;
    try {
      instance = new Recognition();
    } catch {
      activeRef.current = false;
      setActive(false);
      setState('unsupported');
      announce(text.unsupported);
      return;
    }

    instance.lang = locale === 'pt' ? 'pt-BR' : 'en-US';
    instance.continuous = false;
    instance.interimResults = false;
    instance.onstart = () => {
      if (!activeRef.current) return;
      setState('listening');
      if (!listeningAnnouncedRef.current) {
        listeningAnnouncedRef.current = true;
        announce(text.listening);
      }
    };
    instance.onresult = (event) => {
      if (!activeRef.current) return;
      const startIndex = Math.max(0, Math.min(event.resultIndex ?? event.results.length - 1, event.results.length - 1));
      let transcript = '';
      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal) transcript = result[0]?.transcript?.trim() || transcript;
      }
      if (!transcript) return;
      const signature = normalize(transcript);
      if (!signature || signature === lastHandledRef.current) return;
      lastHandledRef.current = signature;
      listeningAnnouncedRef.current = false;
      stopRecognitionInstance();

      const command = identifyVoiceCommand(transcript);
      if (!command) {
        setState('unknown');
        announce(`${text.unknown}: ${transcript}`);
        speak(`${text.unknown}. ${transcript}`);
        return;
      }
      setState('understood');
      const confirmation = locale === 'pt' ? `Comando reconhecido: ${transcript}` : `Command recognized: ${transcript}`;
      announce(confirmation);
      if (!['help', 'pauseRead', 'resumeRead', 'stopRead'].includes(command.action)) speak(confirmation);
      window.dispatchEvent(new CustomEvent('earthsound:action', { detail: command }));
    };
    instance.onerror = (event) => {
      if (!activeRef.current) return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        activeRef.current = false;
        setActive(false);
        setState('permission');
        announce(text.permission);
      } else if (event.error === 'language-not-supported' || event.error === 'audio-capture' || event.error === 'network') {
        activeRef.current = false;
        setActive(false);
        setState('unsupported');
        announce(`${text.unsupported}. ${locale === 'pt' ? 'Use os controles convencionais.' : 'Use the regular controls.'}`);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setState('unknown');
        announce(text.unknown);
      }
    };
    instance.onend = () => {
      if (recognitionRef.current === instance) recognitionRef.current = null;
      lastHandledRef.current = '';
      if (activeRef.current) setState('waiting');
    };

    recognitionRef.current = instance;
    setState('waiting');
    try { instance.start(); }
    catch {
      if (recognitionRef.current === instance) recognitionRef.current = null;
      activeRef.current = false;
      setActive(false);
      setState('unsupported');
      announce(`${text.unsupported}. ${locale === 'pt' ? 'Tente ativar o microfone novamente.' : 'Try enabling the microphone again.'}`);
    }
  }, [locale, text, announce, speak, stopRecognitionInstance]);

  useEffect(() => {
    if (!active || recognitionRef.current || speechStatus === 'speaking') return;
    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = undefined;
      createRecognition();
    }, 320);
    return () => {
      if (restartTimerRef.current !== undefined) window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = undefined;
    };
  }, [active, state, speechStatus, locale, createRecognition]);

  useEffect(() => {
    if (localeRef.current !== locale) {
      localeRef.current = locale;
      activeRef.current = false;
      listeningAnnouncedRef.current = false;
      setActive(false);
      stopRecognitionInstance();
      setState('off');
      announce(locale === 'pt' ? 'Idioma alterado. Ative o microfone novamente.' : 'Language changed. Enable the microphone again.');
    }
  }, [locale, stopRecognitionInstance, announce]);

  useEffect(() => () => {
    activeRef.current = false;
    stopRecognitionInstance();
  }, [stopRecognitionInstance]);

  const start = useCallback(() => {
    if (!getConstructor()) {
      setState('unsupported');
      announce(`${text.unsupported}. ${locale === 'pt' ? 'A navegação por teclado e os controles manuais continuam disponíveis.' : 'Keyboard navigation and manual controls remain available.'}`);
      return;
    }
    lastHandledRef.current = '';
    listeningAnnouncedRef.current = false;
    activeRef.current = true;
    setActive(true);
    setState('waiting');
    announce(text.waiting);
  }, [locale, text, announce]);

  const stop = useCallback(() => {
    activeRef.current = false;
    listeningAnnouncedRef.current = false;
    setActive(false);
    stopRecognitionInstance();
    setState('off');
    announce(text.off);
  }, [stopRecognitionInstance, announce, text.off]);

  return { state, active, supported, start, stop };
}
