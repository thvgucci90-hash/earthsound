import { Pause, Play, RotateCcw, Square, Volume2, Waves } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { copy } from '../data/i18n';
import type { ReturnTypeSonification } from '../hooks/types';

export function Waveform({ active = false, amplitude = 0.45, label }: { active?: boolean; amplitude?: number; label: string }) {
  const points = Array.from({ length: 48 }, (_, index) => {
    const x = (index / 47) * 340;
    const pulse = Math.sin(index * 0.63) * Math.sin(index * 0.19);
    const y = 22 + pulse * (active ? 22 * amplitude + 5 : 3);
    return `${x},${y}`;
  }).join(' ');
  return <svg className={`waveform ${active ? 'waveform-active' : ''}`} viewBox="0 0 340 44" role="img" aria-label={label}><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function AudioPanel({ audio, title, explanation, activeValue, activeLabel }: {
  audio: ReturnTypeSonification;
  title: string;
  explanation: string;
  activeValue: number | null;
  activeLabel: string;
}) {
  const { locale, volume, setVolume } = useApp();
  const ui = copy[locale];
  const isPlaying = audio.status === 'playing';
  const amplitude = activeValue === null ? 0.18 : Math.max(0.08, Math.min(1, (activeValue + 2.2) / 4.4));
  const valueLabel = activeValue === null ? '—' : `${(activeValue * 1.8).toFixed(2)} °F`;
  return (
    <section className="audio-panel" aria-labelledby="sonification-title">
      <div className="audio-panel-top"><div><span className="eyebrow"><Waves size={13} aria-hidden="true" /> {ui.temperature.sonicTitle}</span><h2 id="sonification-title">{title}</h2></div><span className={`live-pill ${isPlaying ? 'live' : ''}`}><span />{isPlaying ? (locale === 'pt' ? 'EM CURSO' : 'PLAYING') : (locale === 'pt' ? 'PRONTO' : 'READY')}</span></div>
      <div className="wave-stage"><div className="wave-meta"><span>{ui.common.frequency}<strong>{activeValue === null ? '—' : `${Math.round(165 + ((Math.max(-2.2, Math.min(2.2, activeValue)) + 2.2) / 4.4) * 495)} Hz`}</strong></span><span>{ui.common.intensity}<strong>{activeValue === null ? '—' : `${Math.round(amplitude * 100)}%`}</strong></span></div><Waveform active={isPlaying} amplitude={amplitude} label={locale === 'pt' ? 'Forma de onda sonora; o tom e a intensidade são indicados ao lado.' : 'Sound waveform; pitch and intensity are shown alongside.'} /><div className="wave-caption"><span>{activeLabel}</span><strong>{valueLabel}</strong></div></div>
      <div className="audio-controls" aria-label={locale === 'pt' ? 'Controles de sonificação' : 'Sonification controls'}>
        <button className="play-button" type="button" onClick={() => { if (isPlaying) audio.pause(); else if (audio.status === 'paused') void audio.resume(); else void audio.play(); }} aria-label={isPlaying ? ui.common.pause : audio.status === 'paused' ? ui.common.resume : ui.common.play}>{isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
        <button className="control-button" type="button" onClick={audio.stop} aria-label={ui.common.stop}><Square size={15} fill="currentColor" /></button>
        <button className="control-button" type="button" onClick={() => void audio.play(true)} aria-label={ui.common.restart}><RotateCcw size={16} /></button>
        <label className="volume-control"><Volume2 size={16} aria-hidden="true" /><span className="sr-only">{ui.common.volume}</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label={ui.common.volume} /></label>
        <label className="speed-control"><span>{ui.common.speed}</span><select value={audio.speed} onChange={(e) => audio.setSpeed(Number(e.target.value))} aria-label={ui.common.speed}><option value="0.7">0.7×</option><option value="1">1×</option><option value="1.5">1.5×</option></select></label>
      </div>
      <p className="audio-explanation">{explanation}</p>
      <p className="audio-caption" aria-live="polite">{audio.status === 'unsupported' ? (locale === 'pt' ? 'Web Audio API não está disponível neste navegador; use o mapa e os controles visuais.' : 'Web Audio API is not available in this browser; use the map and visual controls.') : `${ui.common.status}: ${audio.status === 'playing' ? ui.common.play : audio.status === 'paused' ? ui.common.pause : ui.common.stop}`}</p>
    </section>
  );
}
