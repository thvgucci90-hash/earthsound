import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '../data/i18n';

export type SpeechStatus = 'idle' | 'speaking' | 'paused' | 'unsupported' | 'error';

type Synth = typeof window.speechSynthesis;

function splitSpeech(text: string, maxLength = 190): string[] {
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+|$)/gu) ?? [text];
  const chunks: string[] = [];
  let current = '';

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;
    if ((current + ' ' + sentence).trim().length <= maxLength) {
      current = (current + ' ' + sentence).trim();
      continue;
    }
    if (current) chunks.push(current);
    current = '';
    if (sentence.length <= maxLength) {
      current = sentence;
      continue;
    }
    for (const word of sentence.split(/\s+/u)) {
      if ((current + ' ' + word).trim().length > maxLength && current) {
        chunks.push(current);
        current = word;
      } else {
        current = (current + ' ' + word).trim();
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function getVoice(synth: Synth, locale: Locale): SpeechSynthesisVoice | undefined {
  const language = locale === 'pt' ? 'pt-br' : 'en-us';
  const voices = synth.getVoices();
  return voices.find((voice) => voice.lang.toLowerCase().replace('_', '-') === language)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(locale));
}

export function useSpeechSynthesis(locale: Locale, volume: number) {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<SpeechStatus>('idle');
  const queueRef = useRef<string[]>([]);
  const generationRef = useRef(0);
  const startTimerRef = useRef<number | undefined>(undefined);
  const nextChunkRef = useRef<(generation: number) => void>(() => undefined);

  const setStatusSafe = useCallback((next: SpeechStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const speakNext = useCallback((generation: number) => {
    if (generation !== generationRef.current) return;
    const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      queueRef.current = [];
      setError('unsupported');
      setStatusSafe('unsupported');
      return;
    }

    const text = queueRef.current.shift();
    if (!text) {
      setStatusSafe('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 0.94;
    utterance.volume = Math.max(0, Math.min(1, volume));
    const voice = getVoice(synth, locale);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (generation === generationRef.current) {
        if (statusRef.current === 'paused') return;
        if (startTimerRef.current !== undefined) window.clearTimeout(startTimerRef.current);
        startTimerRef.current = window.setTimeout(() => {
          startTimerRef.current = undefined;
          nextChunkRef.current(generation);
        }, 45);
      }
    };
    utterance.onerror = (event) => {
      if (generation !== generationRef.current) return;
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      queueRef.current = [];
      setError(event.error || 'speech-error');
      setStatusSafe('error');
    };

    try {
      synth.speak(utterance);
    } catch {
      queueRef.current = [];
      setError('speech-error');
      setStatusSafe('error');
    }
  }, [locale, volume, setStatusSafe]);

  useEffect(() => { nextChunkRef.current = speakNext; }, [speakNext]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const refreshVoices = () => { synth.getVoices(); };
    synth.addEventListener?.('voiceschanged', refreshVoices);
    refreshVoices();
    return () => synth.removeEventListener?.('voiceschanged', refreshVoices);
  }, []);

  const speak = useCallback((rawText: string) => {
    const text = rawText.replace(/\s+/gu, ' ').trim();
    if (!text) return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setError('unsupported');
      setStatusSafe('unsupported');
      return;
    }

    generationRef.current += 1;
    const generation = generationRef.current;
    queueRef.current = splitSpeech(text);
    setError(null);
    if (startTimerRef.current !== undefined) window.clearTimeout(startTimerRef.current);
    try { window.speechSynthesis.cancel(); } catch { /* Browser speech is an optional enhancement. */ }
    setStatusSafe('speaking');

    // A short delay after cancel() avoids losing the first utterance in some browser engines.
    startTimerRef.current = window.setTimeout(() => {
      startTimerRef.current = undefined;
      nextChunkRef.current(generation);
    }, 90);
  }, [setStatusSafe]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'speaking' || !('speechSynthesis' in window)) return;
    if (startTimerRef.current !== undefined) window.clearTimeout(startTimerRef.current);
    startTimerRef.current = undefined;
    try {
      window.speechSynthesis.pause();
      setStatusSafe('paused');
    } catch { setError('speech-error'); setStatusSafe('error'); }
  }, [setStatusSafe]);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused' || !('speechSynthesis' in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.resume();
      setStatusSafe('speaking');
      if (!synth.speaking && !synth.pending && queueRef.current.length) {
        const generation = generationRef.current;
        startTimerRef.current = window.setTimeout(() => {
          startTimerRef.current = undefined;
          nextChunkRef.current(generation);
        }, 45);
      }
    } catch { setError('speech-error'); setStatusSafe('error'); }
  }, [setStatusSafe]);

  const stop = useCallback(() => {
    generationRef.current += 1;
    queueRef.current = [];
    if (startTimerRef.current !== undefined) window.clearTimeout(startTimerRef.current);
    startTimerRef.current = undefined;
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* Browser speech may already be idle. */ }
    setError(null);
    setStatusSafe('idle');
  }, [setStatusSafe]);

  useEffect(() => () => {
    generationRef.current += 1;
    queueRef.current = [];
    if (startTimerRef.current !== undefined) window.clearTimeout(startTimerRef.current);
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* Unmount cleanup. */ }
  }, []);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  return { status, error, supported, speak, pause, resume, stop };
}
