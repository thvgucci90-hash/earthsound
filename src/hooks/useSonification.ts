import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { anomalyToTone } from '../lib/temperature';

type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'unsupported';
let sharedAudioContext: AudioContext | null = null;

export function primeAudioContext() {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return;
  try {
    sharedAudioContext ??= new window.AudioContext();
    if (sharedAudioContext.state === 'suspended') void sharedAudioContext.resume();
  } catch { /* Audio stays optional; the visual and spoken alternatives remain available. */ }
}

export function useSonification(onStep?: (index: number) => void) {
  const { volume } = useApp();
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [step, setStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const contextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const previewTimersRef = useRef<number[]>([]);
  const valuesRef = useRef<(number | null)[]>([]);
  const stepRef = useRef(-1);
  const volumeRef = useRef(volume);
  const speedRef = useRef(speed);
  const statusRef = useRef(status);
  const onStepRef = useRef(onStep);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { onStepRef.current = onStep; }, [onStep]);

  const ensureNodes = useCallback(async () => {
    if (typeof window.AudioContext === 'undefined') return false;
    if (!contextRef.current) {
      sharedAudioContext ??= new window.AudioContext();
      const context = sharedAudioContext;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      contextRef.current = context;
      oscillatorRef.current = oscillator;
      gainRef.current = gain;
    }
    if (contextRef.current.state === 'suspended') await contextRef.current.resume();
    return true;
  }, []);

  const soundValue = useCallback((index: number, release = false) => {
    const context = contextRef.current;
    const oscillator = oscillatorRef.current;
    const gain = gainRef.current;
    const value = valuesRef.current[index];
    if (!context || !oscillator || !gain) return;
    if (value === null || value === undefined) {
      gain.gain.setTargetAtTime(0, context.currentTime, 0.05);
      return;
    }
    const { frequency, intensity } = anomalyToTone(value);
    oscillator.frequency.setTargetAtTime(frequency, context.currentTime, 0.04);
    gain.gain.setTargetAtTime(release ? 0 : intensity * volumeRef.current, context.currentTime, 0.04);
  }, []);

  const setSeries = useCallback((values: (number | null)[]) => {
    valuesRef.current = [...values];
    if (statusRef.current === 'playing' && stepRef.current >= 0) soundValue(stepRef.current);
  }, [soundValue]);

  const notifyStep = useCallback((index: number) => {
    stepRef.current = index;
    setStep(index);
    onStepRef.current?.(index);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const clearPreviewTimers = useCallback(() => {
    previewTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    previewTimersRef.current = [];
  }, []);

  const tick = useCallback(() => {
    clearTimer();
    const nextIndex = stepRef.current + 1;
    if (nextIndex >= valuesRef.current.length) {
      soundValue(Math.max(0, stepRef.current), true);
      setStatus('idle');
      statusRef.current = 'idle';
      notifyStep(-1);
      return;
    }
    notifyStep(nextIndex);
    soundValue(nextIndex);
    timerRef.current = window.setTimeout(tick, 720 / speedRef.current);
  }, [clearTimer, notifyStep, soundValue]);

  const play = useCallback(async (fromBeginning = false) => {
    if (!valuesRef.current.length) return;
    const ready = await ensureNodes();
    if (!ready) {
      setStatus('unsupported');
      statusRef.current = 'unsupported';
      return;
    }
    clearTimer();
    clearPreviewTimers();
    if (fromBeginning || stepRef.current < 0 || stepRef.current >= valuesRef.current.length - 1) notifyStep(-1);
    setStatus('playing');
    statusRef.current = 'playing';
    tick();
  }, [ensureNodes, clearTimer, clearPreviewTimers, notifyStep, tick]);

  const pause = useCallback(() => {
    clearTimer();
    clearPreviewTimers();
    soundValue(Math.max(0, stepRef.current), true);
    setStatus('paused');
    statusRef.current = 'paused';
  }, [clearTimer, clearPreviewTimers, soundValue]);

  const resume = useCallback(async () => {
    if (statusRef.current !== 'paused') return;
    const ready = await ensureNodes();
    if (!ready) return;
    setStatus('playing');
    statusRef.current = 'playing';
    const index = Math.max(0, stepRef.current);
    notifyStep(index);
    soundValue(index);
    timerRef.current = window.setTimeout(tick, 720 / speedRef.current);
  }, [ensureNodes, notifyStep, soundValue, tick]);

  const stop = useCallback(() => {
    clearTimer();
    clearPreviewTimers();
    soundValue(Math.max(0, stepRef.current), true);
    setStatus('idle');
    statusRef.current = 'idle';
    notifyStep(-1);
  }, [clearTimer, clearPreviewTimers, notifyStep, soundValue]);

  const preview = useCallback(async (index: number, duration = 280) => {
    if (statusRef.current === 'playing') return;
    const ready = await ensureNodes();
    if (!ready) { setStatus('unsupported'); return; }
    clearPreviewTimers();
    notifyStep(index);
    soundValue(index);
    const fadeTimer = window.setTimeout(() => { soundValue(index, true); previewTimersRef.current = previewTimersRef.current.filter((timer) => timer !== fadeTimer); }, duration);
    const resetTimer = window.setTimeout(() => { if (statusRef.current !== 'playing') notifyStep(-1); previewTimersRef.current = previewTimersRef.current.filter((timer) => timer !== resetTimer); }, duration + 50);
    previewTimersRef.current.push(fadeTimer, resetTimer);
  }, [ensureNodes, clearPreviewTimers, notifyStep, soundValue]);

  const seek = useCallback(async (index: number) => {
    const safe = Math.max(0, Math.min(valuesRef.current.length - 1, index));
    if (statusRef.current === 'playing') {
      clearTimer();
      clearPreviewTimers();
      notifyStep(safe);
      soundValue(safe);
      timerRef.current = window.setTimeout(tick, 720 / speedRef.current);
      return;
    }
    if (statusRef.current === 'paused') {
      clearPreviewTimers();
      notifyStep(safe);
      soundValue(safe, true);
      return;
    }
    await preview(safe, 220);
  }, [clearTimer, clearPreviewTimers, notifyStep, preview, soundValue, tick]);

  useEffect(() => {
    const handle = (event: WindowEventMap['earthsound:page-action']) => {
      switch (event.detail.action) {
        case 'play': void play(); break;
        case 'pause': pause(); break;
        case 'resume': void resume(); break;
        case 'stop': stop(); break;
        case 'volumeUp': window.dispatchEvent(new CustomEvent('earthsound:volume-step', { detail: { amount: 0.1 } })); break;
        case 'volumeDown': window.dispatchEvent(new CustomEvent('earthsound:volume-step', { detail: { amount: -0.1 } })); break;
      }
    };
    window.addEventListener('earthsound:page-action', handle);
    return () => window.removeEventListener('earthsound:page-action', handle);
  }, [play, pause, resume, stop]);

  useEffect(() => {
    const handleVolume = (event: WindowEventMap['earthsound:volume']) => {
      volumeRef.current = event.detail.volume;
      if (statusRef.current === 'playing' && stepRef.current >= 0) soundValue(stepRef.current);
    };
    const handleStep = (event: Event) => {
      const amount = (event as CustomEvent<{ amount: number }>).detail.amount;
      window.dispatchEvent(new CustomEvent('earthsound:volume-update', { detail: { amount } }));
    };
    window.addEventListener('earthsound:volume', handleVolume);
    window.addEventListener('earthsound:volume-step', handleStep);
    return () => {
      window.removeEventListener('earthsound:volume', handleVolume);
      window.removeEventListener('earthsound:volume-step', handleStep);
    };
  }, [soundValue]);

  useEffect(() => () => {
    clearTimer();
    clearPreviewTimers();
    try { oscillatorRef.current?.stop(); } catch { /* already stopped */ }
    oscillatorRef.current?.disconnect();
    gainRef.current?.disconnect();
  }, [clearTimer, clearPreviewTimers]);

  return { status, step, speed, setSpeed, setSeries, play, pause, resume, stop, preview, seek };
}
