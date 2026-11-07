import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, CirclePause, CirclePlay, Film, Info, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { materialCopy } from '../data/materialCopy';
import { nasaResources, type MaterialCategory, type NASAResource } from '../data/nasaResources';
import { PageIntro, SourceLink } from '../components/Common';
import { MaterialSonificationPanel } from '../components/MaterialSonificationPanel';
import { getMaterialSonificationProfile } from '../data/materialSonification';

const categories: Array<'all' | MaterialCategory> = ['all', 'ozone', 'ice', 'atmosphere', 'biosphere', 'land', 'agriculture', 'climate'];

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const whole = Math.floor(value);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function audioNote(resource: NASAResource, text: (typeof materialCopy)['pt']) {
  if (resource.audioStatus === 'present') return text.audioPresent;
  if (resource.audioStatus === 'absent') return text.audioAbsent;
  return text.audioUnverified;
}

export function MaterialsPage() {
  const { locale, volume, setVolume, speak, readPage, speechStatus, pauseSpeech, resumeSpeech, stopSpeech, announce } = useApp();
  const copy = materialCopy[locale];
  const [activeCategory, setActiveCategory] = useState<'all' | MaterialCategory>('all');
  const [selectedId, setSelectedId] = useState(nasaResources[0]?.id ?? '');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerMessage, setPlayerMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const selected = nasaResources.find((resource) => resource.id === selectedId) ?? nasaResources[0];
  const filtered = useMemo(() => activeCategory === 'all' ? nasaResources : nasaResources.filter((resource) => resource.category === activeCategory), [activeCategory]);
  const selectedIndex = selected ? filtered.findIndex((resource) => resource.id === selected.id) : -1;

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      setMediaError(true);
      setPlayerMessage(copy.mediaUnavailable);
      return;
    }
    try {
      await video.play();
      setIsPlaying(true);
      setMediaError(false);
      setPlayerMessage('');
    } catch {
      setIsPlaying(false);
      setPlayerMessage(locale === 'pt' ? 'A reprodução foi bloqueada pelo navegador. Use o botão reproduzir do player.' : 'Playback was blocked by the browser. Use the player’s play button.');
    }
  }, [copy.mediaUnavailable, locale]);

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
    pauseSpeech();
  }, [pauseSpeech]);

  const stopVideo = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setCurrentTime(0);
    setIsPlaying(false);
    stopSpeech();
  }, [stopSpeech]);

  const selectResource = useCallback((resource: NASAResource) => {
    videoRef.current?.pause();
    stopSpeech();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMediaLoading(true);
    setMediaError(false);
    setPlayerMessage('');
    setSelectedId(resource.id);
    announce(`${copy.selected}: ${resource.title}`);
  }, [announce, copy.selected, stopSpeech]);

  const stepResource = useCallback((step: -1 | 1) => {
    if (selectedIndex < 0 || filtered.length < 2) return;
    const next = filtered[(selectedIndex + step + filtered.length) % filtered.length];
    if (next) selectResource(next);
  }, [filtered, selectResource, selectedIndex]);

  const resumeNarration = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
    resumeSpeech();
  }, [resumeSpeech]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.playbackRate = playbackRate;
  }, [volume, playbackRate, selectedId]);

  useEffect(() => {
    const handleAction = (event: WindowEventMap['earthsound:page-action']) => {
      const { action } = event.detail;
      if (action === 'play') void playVideo();
      if (action === 'pause') pauseVideo();
      if (action === 'resume') {
        if (speechStatus === 'paused') resumeNarration();
        else void playVideo();
      }
      if (action === 'stop') stopVideo();
      if (action === 'readPage') {
        videoRef.current?.pause();
        setIsPlaying(false);
        readPage();
      }
      if (action === 'readDescription' && selected) {
        videoRef.current?.pause();
        setIsPlaying(false);
        window.dispatchEvent(new CustomEvent('earthsound:before-read-page'));
        const soundProfile = getMaterialSonificationProfile(selected.id);
        const soundDescription = soundProfile ? ` ${copy.sonification.title}. ${soundProfile.modeLabel[locale]}. ${soundProfile.mapping[locale]} ${soundProfile.limitation[locale]}` : '';
        const description = `${selected.title}. ${selected.description[locale]} ${copy.period}: ${selected.period}. ${copy.variable}: ${selected.variables[locale]} ${selected.caution[locale]}${soundDescription}`;
        speak(description);
      }
    };
    window.addEventListener('earthsound:page-action', handleAction);
    return () => window.removeEventListener('earthsound:page-action', handleAction);
  }, [copy.period, copy.variable, locale, pauseVideo, playVideo, readPage, resumeNarration, selected, speak, speechStatus, stopVideo]);

  useEffect(() => {
    const pauseForPageReading = () => {
      videoRef.current?.pause();
      setIsPlaying(false);
    };
    window.addEventListener('earthsound:before-read-page', pauseForPageReading);
    return () => window.removeEventListener('earthsound:before-read-page', pauseForPageReading);
  }, []);

  function chooseCategory(category: 'all' | MaterialCategory) {
    setActiveCategory(category);
    if (category !== 'all' && selected?.category !== category) {
      const first = nasaResources.find((resource) => resource.category === category);
      if (first) selectResource(first);
    }
  }

  if (!selected) return <div className="page-wrap"><PageIntro eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} /><p>{copy.mediaUnavailable}</p></div>;

  const soundProfile = getMaterialSonificationProfile(selected.id);
  const soundDescription = soundProfile ? ` ${copy.sonification.title}. ${soundProfile.modeLabel[locale]}. ${soundProfile.mapping[locale]} ${soundProfile.limitation[locale]}` : '';
  const spokenDescription = `${selected.title}. ${selected.description[locale]} ${copy.period}: ${selected.period}. ${copy.variable}: ${selected.variables[locale]} ${selected.caution[locale]} ${audioNote(selected, copy)}${soundDescription}`;
  const categoryName = copy.categories[selected.category];
  const startNarration = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
    window.dispatchEvent(new CustomEvent('earthsound:before-read-page'));
    speak(spokenDescription);
  };
  const readCurrentPage = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
    readPage();
  };

  return <div className="page-wrap materials-page">
    <PageIntro eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="materials-intro-actions">
        <button type="button" className="button button-secondary" onClick={readCurrentPage}><AudioLines size={15} aria-hidden="true" />{locale === 'pt' ? 'Ler esta página' : 'Read this page'}</button>
        <Link className="button button-text" to="/catalogo"><ArrowLeft size={15} aria-hidden="true" />{copy.backCatalog}</Link>
      </div>
    </PageIntro>

    <section className="material-library" aria-label={locale === 'pt' ? 'Biblioteca de vídeos e filtros' : 'Video library and filters'}>
      <div className="material-filter-row" role="group" aria-label={locale === 'pt' ? 'Filtrar por tema' : 'Filter by topic'}>
        {categories.map((category) => <button key={category} type="button" className={`material-filter ${activeCategory === category ? 'active' : ''}`} aria-pressed={activeCategory === category} onClick={() => chooseCategory(category)}>{copy.categories[category]}</button>)}
        <span className="material-count">{nasaResources.length} {locale === 'pt' ? 'recursos NASA' : 'NASA resources'}</span>
      </div>

      <section className="material-viewer panel" aria-labelledby="material-title">
        <div className="material-player-column">
          <div className="material-player-frame">
            {mediaError ? <div className="material-media-fallback"><Film size={28} aria-hidden="true" /><p>{playerMessage || copy.mediaUnavailable}</p><button className="button button-small button-secondary" type="button" onClick={() => { setMediaLoading(true); setMediaError(false); setPlayerMessage(''); }}>{copy.retry}</button><SourceLink href={selected.pageUrl}>{copy.openSource}</SourceLink></div> : <>
              <video
                key={selected.id}
                ref={videoRef}
                className="material-video"
                poster={selected.posterUrl}
                controls
                playsInline
                preload="metadata"
                aria-label={`${selected.title}. ${copy.mediaAlternative}`}
                aria-describedby="material-video-description"
                onLoadStart={() => setMediaLoading(true)}
                onCanPlay={() => setMediaLoading(false)}
                onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); event.currentTarget.volume = volume; event.currentTarget.playbackRate = playbackRate; setMediaLoading(false); setMediaError(false); }}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => { setIsPlaying(true); if (speechStatus === 'speaking' || speechStatus === 'paused') stopSpeech(); }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => { setMediaLoading(false); setMediaError(true); setIsPlaying(false); setPlayerMessage(copy.mediaUnavailable); }}
                onVolumeChange={(event) => { const next = event.currentTarget.volume; if (Math.abs(next - volume) > 0.02) setVolume(next); }}
              >
                <source src={selected.mediaUrl} type={selected.mediaType} />
                {copy.mediaAlternative}
              </video>
              {mediaLoading && <div className="material-loading" role="status">{copy.loading}</div>}
            </>}
          </div>
          <div className="material-player-controls">
            <div className="material-transport">
              <button type="button" className="button button-primary button-small" onClick={() => isPlaying ? pauseVideo() : void playVideo()} aria-label={isPlaying ? copy.pause : copy.play}>{isPlaying ? <CirclePause size={15} /> : <CirclePlay size={15} />}{isPlaying ? copy.pause : copy.play}</button>
              <button type="button" className="button button-quiet button-small" onClick={stopVideo}>{copy.stop}</button>
              <button type="button" className="icon-button material-step" onClick={() => stepResource(-1)} disabled={filtered.length < 2} aria-label={copy.previous}><ArrowLeft size={16} /></button>
              <button type="button" className="icon-button material-step" onClick={() => stepResource(1)} disabled={filtered.length < 2} aria-label={copy.next}><ArrowRight size={16} /></button>
            </div>
            <div className="material-rate-volume">
              <label className="material-rate"><span>{copy.playbackRate}</span><select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
              <label className="material-volume"><Volume2 size={15} aria-hidden="true" /><span className="sr-only">{locale === 'pt' ? 'Volume geral' : 'Overall volume'}</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label={locale === 'pt' ? 'Volume geral' : 'Overall volume'} /></label>
            </div>
            <div className="material-progress" aria-label={locale === 'pt' ? 'Progresso do vídeo' : 'Video progress'}>{duration > 0 && <progress value={Math.min(currentTime, duration)} max={duration} aria-label={locale === 'pt' ? 'Progresso' : 'Progress'} />}<span>{formatTime(currentTime)} / {formatTime(duration)}</span></div>
            {playerMessage && !mediaError && <p className="material-player-message" role="status" aria-live="polite">{playerMessage}</p>}
          </div>
          <p id="material-video-description" className="material-screenreader-description">{copy.mediaAlternative} {selected.description[locale]}</p>
        </div>

        <div className="material-detail-column">
          <div className="material-detail-top"><span className="material-category-label">{categoryName}</span><span className="material-index">NASA SVS / {String(nasaResources.findIndex((item) => item.id === selected.id) + 1).padStart(2, '0')}</span></div>
          <h2 id="material-title">{selected.title}</h2>
          <div className="material-period"><span>{copy.period}</span><strong>{selected.period}</strong></div>
          <h3>{copy.description}</h3>
          <p className="material-description">{selected.description[locale]}</p>
          <div className="material-fact"><h3>{copy.variable}</h3><p>{selected.variables[locale]}</p></div>
          <div className="material-caution"><Info size={15} aria-hidden="true" /><p>{selected.caution[locale]}</p></div>
          <div className={`material-audio-status material-audio-${selected.audioStatus}`}><AudioLines size={16} aria-hidden="true" /><div><strong>{copy.audio}</strong><p>{audioNote(selected, copy)}</p></div></div>
          <MaterialSonificationPanel key={selected.id} resourceId={selected.id} locale={locale} resourceSourceUrl={selected.pageUrl} />
          <div className="material-narration"><div className="material-narration-controls">
            <button type="button" className="button button-secondary button-small" onClick={speechStatus === 'speaking' ? pauseSpeech : speechStatus === 'paused' ? resumeNarration : startNarration} aria-label={speechStatus === 'speaking' ? copy.pauseNarration : speechStatus === 'paused' ? copy.resumeNarration : copy.listen}>
              <AudioLines size={14} aria-hidden="true" />{speechStatus === 'speaking' ? copy.pauseNarration : speechStatus === 'paused' ? copy.resumeNarration : copy.listen}
            </button>
            <button type="button" className="button button-quiet button-small" onClick={stopSpeech} disabled={speechStatus === 'idle'}>{copy.stopNarration}</button>
          </div><p>{copy.narrationNote}</p></div>
          <SourceLink href={selected.pageUrl} className="material-source">{copy.openSource}</SourceLink>
        </div>
      </section>

      <section className="material-selection" aria-labelledby="material-selection-title">
        <div className="material-selection-heading"><div><p className="eyebrow">{copy.collection}</p><h2 id="material-selection-title">{locale === 'pt' ? 'Escolha o próximo registro' : 'Choose another record'}</h2></div><span>{filtered.length} {locale === 'pt' ? 'disponíveis' : 'available'}</span></div>
        <div className="material-card-list">
          {filtered.map((resource) => <button key={resource.id} type="button" className={`material-card ${selected.id === resource.id ? 'selected' : ''}`} aria-pressed={selected.id === resource.id} onClick={() => selectResource(resource)}>
            <span className="material-card-thumb"><img src={resource.posterUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /><span className="material-thumb-icon"><Film size={16} aria-hidden="true" /></span></span>
            <span className="material-card-copy"><span className="material-card-category">{copy.categories[resource.category]} · {resource.period}</span><strong>{resource.title}</strong><span>{resource.description[locale]}</span><span className="material-card-audio"><AudioLines size={12} aria-hidden="true" />{resource.audioStatus === 'present' ? copy.audioPresent : resource.audioStatus === 'absent' ? copy.audioAbsent : copy.audioUnverified}</span></span>
            <span className="material-card-open"><span className="sr-only">{copy.choose}: </span><ArrowRight size={17} aria-hidden="true" /></span>
          </button>)}
        </div>
      </section>
      <div className="materials-note"><Info size={15} aria-hidden="true" /><p>{copy.soundNote}</p></div>
    </section>
  </div>;
}
