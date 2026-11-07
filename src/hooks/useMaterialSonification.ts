import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '../data/i18n';
import { materialSoundText, type MaterialSoundCategory, type MaterialSoundPoint, type MaterialSoundTrack } from '../data/materialSonification';

export type MaterialPlaybackStatus = 'idle' | 'playing' | 'paused' | 'previewing' | 'unsupported';
const LOW_FREQUENCY = 220;
const HIGH_FREQUENCY = 880;
const BASE_INTERVAL_MS = 200;
const CATEGORY_PREVIEW_MS = 900;
const ANNOUNCEMENT_INTERVAL_MS = 2000;

type AudioNodes = {
  context: AudioContext;
  oscillator: OscillatorNode;
  envelope: GainNode;
  master: GainNode;
};

function getDomain(track: MaterialSoundTrack): readonly [number, number] {
  if (track.domain) return track.domain;
  const values = track.points.flatMap((point) => point.value === null ? [] : [point.value]);
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  return minimum === maximum ? [minimum - 1, maximum + 1] : [minimum, maximum];
}

function frequencyForValue(value: number, track: MaterialSoundTrack): number {
  const [minimum, maximum] = getDomain(track);
  const proportion = Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
  return LOW_FREQUENCY * Math.pow(HIGH_FREQUENCY / LOW_FREQUENCY, proportion);
}

function formatValue(value: number, locale: Locale, decimals: number): string {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function useMaterialSonification(track: MaterialSoundTrack | undefined, locale: Locale) {
  const [status, setStatus] = useState<MaterialPlaybackStatus>('idle');
  const [step, setStep] = useState(-1);
  const [volume, setVolume] = useState(0.45);
  const [speed, setSpeed] = useState(2);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const nodesRef = useRef<AudioNodes | null>(null);
  const trackRef = useRef(track);
  const timerRef = useRef<number | undefined>(undefined);
  const previewTimerRef = useRef<number | undefined>(undefined);
  const stepRef = useRef(-1);
  const volumeRef = useRef(volume);
  const speedRef = useRef(speed);
  const statusRef = useRef(status);
  const previewCategoryRef = useRef<MaterialSoundCategory | null>(null);
  const previewLabelRef = useRef('');
  const previewRemainingRef = useRef(0);
  const previewEndsAtRef = useRef(0);
  const lastAnnouncementAtRef = useRef(0);

  useEffect(() => { trackRef.current = track; }, [track]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const announceCurrent = useCallback((text: string, force = false) => {
    const now = Date.now();
    if (!text || (!force && now - lastAnnouncementAtRef.current < ANNOUNCEMENT_INTERVAL_MS)) return;
    lastAnnouncementAtRef.current = now;
    setAnnouncement(text);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current !== undefined) window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = undefined;
  }, []);

  const setStatusSafe = useCallback((next: MaterialPlaybackStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const ensureNodes = useCallback(async (): Promise<AudioNodes | null> => {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null;
    try {
      if (!nodesRef.current) {
        const context = new window.AudioContext();
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        const master = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        envelope.gain.value = 0;
        master.gain.value = volumeRef.current * 0.16;
        oscillator.connect(envelope);
        envelope.connect(master);
        master.connect(context.destination);
        oscillator.start();
        nodesRef.current = { context, oscillator, envelope, master };
      }
      const nodes = nodesRef.current;
      if (nodes.context.state === 'suspended') await nodes.context.resume();
      return nodes;
    } catch {
      return null;
    }
  }, []);

  const silence = useCallback((release = 0.025) => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    const now = nodes.context.currentTime;
    nodes.envelope.gain.cancelScheduledValues(now);
    nodes.envelope.gain.setTargetAtTime(0, now, release);
  }, []);

  const soundFrequency = useCallback((targetFrequency: number, waveform: OscillatorType, duration = 0.15) => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    const now = nodes.context.currentTime;
    nodes.oscillator.type = waveform;
    nodes.oscillator.frequency.cancelScheduledValues(now);
    nodes.oscillator.frequency.setTargetAtTime(targetFrequency, now, 0.018);
    nodes.envelope.gain.cancelScheduledValues(now);
    nodes.envelope.gain.setValueAtTime(Math.max(0.0001, nodes.envelope.gain.value), now);
    nodes.envelope.gain.linearRampToValueAtTime(1, now + 0.012);
    nodes.envelope.gain.setTargetAtTime(0, now + Math.max(0.01, duration), 0.045);
    setFrequency(Math.round(targetFrequency));
  }, []);

  const playPoint = useCallback((point: MaterialSoundPoint, selectedTrack: MaterialSoundTrack) => {
    const pointLabel = materialSoundText(point.label, locale);
    if (point.value === null) {
      silence();
      setFrequency(null);
      const noValue = locale === 'pt' ? 'sem valor numérico publicado; evento silencioso.' : 'no numeric value published; silent event.';
      const text = `${pointLabel}: ${noValue}`;
      setMessage(text);
      announceCurrent(text, stepRef.current === 0);
      return;
    }
    const unit = materialSoundText(selectedTrack.unit, locale);
    const nextFrequency = frequencyForValue(point.value, selectedTrack);
    const valueText = formatValue(point.value, locale, selectedTrack.decimals ?? 2);
    soundFrequency(nextFrequency, 'sine', Math.min(0.15, (BASE_INTERVAL_MS / speedRef.current) * 0.8));
    const text = `${pointLabel}: ${valueText} ${unit}`;
    setMessage(text);
    announceCurrent(`${text}; ${Math.round(nextFrequency)} Hz.`, stepRef.current === 0);
  }, [announceCurrent, locale, silence, soundFrequency]);

  const finishPreview = useCallback(() => {
    previewTimerRef.current = undefined;
    previewRemainingRef.current = 0;
    previewEndsAtRef.current = 0;
    silence();
    setStatusSafe('idle');
  }, [setStatusSafe, silence]);

  const runCategoryPreview = useCallback(async (category: MaterialSoundCategory, spokenLabel: string, durationMs: number) => {
    clearTimer();
    clearPreviewTimer();
    silence();
    previewCategoryRef.current = category;
    previewLabelRef.current = spokenLabel;
    previewRemainingRef.current = durationMs;
    const nodes = await ensureNodes();
    if (!nodes) {
      setStatusSafe('unsupported');
      const unsupported = locale === 'pt' ? 'A Web Audio API não pôde ser iniciada.' : 'The Web Audio API could not start.';
      setMessage(unsupported);
      announceCurrent(unsupported, true);
      return;
    }
    setStep(-1);
    stepRef.current = -1;
    setStatusSafe('previewing');
    setMessage(spokenLabel);
    announceCurrent(`${spokenLabel}; ${Math.round(category.frequencyHz)} Hz.`, true);
    soundFrequency(category.frequencyHz, category.waveform, Math.min(0.8, (durationMs / 1000) * 0.8));
    previewEndsAtRef.current = Date.now() + durationMs;
    previewTimerRef.current = window.setTimeout(finishPreview, durationMs);
  }, [announceCurrent, clearPreviewTimer, clearTimer, ensureNodes, finishPreview, locale, setStatusSafe, silence, soundFrequency]);

  const stop = useCallback(() => {
    clearTimer();
    clearPreviewTimer();
    silence();
    stepRef.current = -1;
    setStep(-1);
    setFrequency(null);
    setMessage('');
    previewRemainingRef.current = 0;
    previewEndsAtRef.current = 0;
    setStatusSafe('idle');
  }, [clearPreviewTimer, clearTimer, setStatusSafe, silence]);

  const tickRef = useRef<() => void>(() => undefined);
  tickRef.current = () => {
    clearTimer();
    const selectedTrack = trackRef.current;
    if (!selectedTrack || !selectedTrack.points.length) {
      silence();
      setStatusSafe('idle');
      return;
    }
    const next = stepRef.current + 1;
    if (next >= selectedTrack.points.length) {
      silence();
      stepRef.current = -1;
      setStep(-1);
      setStatusSafe('idle');
      setMessage('');
      const finished = locale === 'pt' ? 'Sequência sonora concluída.' : 'Sonification sequence complete.';
      announceCurrent(finished, true);
      return;
    }
    stepRef.current = next;
    setStep(next);
    playPoint(selectedTrack.points[next]!, selectedTrack);
    timerRef.current = window.setTimeout(tickRef.current, BASE_INTERVAL_MS / speedRef.current);
  };

  const play = useCallback(async (fromBeginning = false) => {
    if (statusRef.current === 'playing') return;
    clearTimer();
    clearPreviewTimer();
    const selectedTrack = trackRef.current;
    if (!selectedTrack || selectedTrack.points.length === 0) return;
    const nodes = await ensureNodes();
    if (!nodes) {
      setStatusSafe('unsupported');
      const unsupported = locale === 'pt' ? 'A Web Audio API não pôde ser iniciada.' : 'The Web Audio API could not start.';
      setMessage(unsupported);
      announceCurrent(unsupported, true);
      return;
    }
    previewCategoryRef.current = null;
    previewLabelRef.current = '';
    previewRemainingRef.current = 0;
    if (fromBeginning || stepRef.current < 0 || stepRef.current >= selectedTrack.points.length - 1) {
      stepRef.current = -1;
      lastAnnouncementAtRef.current = 0;
    }
    setStatusSafe('playing');
    tickRef.current();
  }, [announceCurrent, clearPreviewTimer, clearTimer, ensureNodes, locale, setStatusSafe]);

  const pause = useCallback(() => {
    if (statusRef.current === 'previewing') {
      const remaining = Math.max(0, previewEndsAtRef.current - Date.now());
      clearPreviewTimer();
      silence();
      if (remaining === 0) {
        finishPreview();
        return;
      }
      previewRemainingRef.current = remaining;
      previewEndsAtRef.current = 0;
      setStatusSafe('paused');
      announceCurrent(locale === 'pt' ? 'Prévia sonora pausada.' : 'Sound preview paused.', true);
      return;
    }
    if (statusRef.current !== 'playing') return;
    clearTimer();
    silence();
    setStatusSafe('paused');
    announceCurrent(locale === 'pt' ? 'Sonificação pausada.' : 'Sonification paused.', true);
  }, [announceCurrent, clearPreviewTimer, clearTimer, finishPreview, locale, setStatusSafe, silence]);

  const resume = useCallback(async () => {
    if (statusRef.current !== 'paused') {
      if (statusRef.current === 'idle') void play();
      return;
    }
    if (previewCategoryRef.current) {
      const category = previewCategoryRef.current;
      void runCategoryPreview(category, previewLabelRef.current || materialSoundText(category.label, locale), previewRemainingRef.current || CATEGORY_PREVIEW_MS);
      return;
    }
    const nodes = await ensureNodes();
    if (!nodes) {
      setStatusSafe('unsupported');
      const unsupported = locale === 'pt' ? 'A Web Audio API não pôde ser iniciada.' : 'The Web Audio API could not start.';
      setMessage(unsupported);
      announceCurrent(unsupported, true);
      return;
    }
    setStatusSafe('playing');
    announceCurrent(locale === 'pt' ? 'Sonificação retomada.' : 'Sonification resumed.', true);
    tickRef.current();
  }, [announceCurrent, ensureNodes, locale, play, runCategoryPreview, setStatusSafe]);

  const previewCategory = useCallback(async (category: MaterialSoundCategory, spokenLabel = materialSoundText(category.label, locale)) => {
    lastAnnouncementAtRef.current = 0;
    await runCategoryPreview(category, spokenLabel, CATEGORY_PREVIEW_MS);
  }, [locale, runCategoryPreview]);

  const restart = useCallback((category?: MaterialSoundCategory, spokenLabel?: string) => {
    const selectedCategory = previewCategoryRef.current ?? category;
    if (selectedCategory) {
      const label = previewLabelRef.current || spokenLabel || materialSoundText(selectedCategory.label, locale);
      lastAnnouncementAtRef.current = 0;
      void runCategoryPreview(selectedCategory, label, CATEGORY_PREVIEW_MS);
      return;
    }
    stop();
    void play(true);
  }, [locale, play, runCategoryPreview, stop]);

  const setSafeVolume = useCallback((value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    volumeRef.current = nextVolume;
    setVolume(nextVolume);
    const nodes = nodesRef.current;
    if (nodes) nodes.master.gain.setTargetAtTime(nextVolume * 0.16, nodes.context.currentTime, 0.02);
  }, []);

  const setSafeSpeed = useCallback((value: number) => {
    const nextSpeed = Math.max(1, Math.min(4, value));
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
  }, []);

  useEffect(() => {
    const handleAction = (event: WindowEventMap['earthsound:page-action']) => {
      switch (event.detail.action) {
        case 'play': void play(); break;
        case 'pause': pause(); break;
        case 'resume': void resume(); break;
        case 'stop': stop(); break;
        case 'volumeUp':
          setSafeVolume(volumeRef.current + 0.1);
          window.dispatchEvent(new CustomEvent('earthsound:volume-update', { detail: { amount: 0.1 } }));
          break;
        case 'volumeDown':
          setSafeVolume(volumeRef.current - 0.1);
          window.dispatchEvent(new CustomEvent('earthsound:volume-update', { detail: { amount: -0.1 } }));
          break;
      }
    };
    const pauseForReading = () => pause();
    const stopOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') stop(); };
    window.addEventListener('earthsound:page-action', handleAction);
    window.addEventListener('earthsound:before-read-page', pauseForReading);
    window.addEventListener('keydown', stopOnEscape);
    return () => {
      window.removeEventListener('earthsound:page-action', handleAction);
      window.removeEventListener('earthsound:before-read-page', pauseForReading);
      window.removeEventListener('keydown', stopOnEscape);
    };
  }, [pause, play, resume, setSafeVolume, stop]);

  useEffect(() => {
    clearTimer();
    clearPreviewTimer();
    silence();
    stepRef.current = -1;
    previewCategoryRef.current = null;
    previewLabelRef.current = '';
    previewRemainingRef.current = 0;
    previewEndsAtRef.current = 0;
    lastAnnouncementAtRef.current = 0;
    setStep(-1);
    setFrequency(null);
    setMessage('');
    setAnnouncement('');
    setStatusSafe('idle');
  }, [track, clearPreviewTimer, clearTimer, setStatusSafe, silence]);

  useEffect(() => () => {
    clearTimer();
    clearPreviewTimer();
    const nodes = nodesRef.current;
    if (!nodes) return;
    try { nodes.oscillator.stop(); } catch { /* already stopped */ }
    nodes.oscillator.disconnect();
    nodes.envelope.disconnect();
    nodes.master.disconnect();
    void nodes.context.close();
    nodesRef.current = null;
  }, [clearPreviewTimer, clearTimer]);

  return {
    status,
    step,
    volume,
    setVolume: setSafeVolume,
    speed,
    setSpeed: setSafeSpeed,
    frequency,
    message,
    announcement,
    play,
    pause,
    resume,
    stop,
    restart,
    previewCategory,
  };
}
