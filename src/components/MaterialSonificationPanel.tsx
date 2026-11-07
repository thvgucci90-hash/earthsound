import { useEffect, useState } from 'react';
import { AudioLines, CirclePause, CirclePlay, RotateCcw, Square, Volume2 } from 'lucide-react';
import type { Locale } from '../data/i18n';
import { materialCopy } from '../data/materialCopy';
import { materialSonificationSnapshot } from '../data/materialSonificationSeries';
import { getMaterialSonificationProfile, materialSoundText, type MaterialSoundCategory, type MaterialSoundTrack } from '../data/materialSonification';
import { useMaterialSonification } from '../hooks/useMaterialSonification';

function formatValue(value: number, locale: Locale, decimals: number) {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function sourceLabel(locale: Locale, track: MaterialSoundTrack | undefined) {
  if (!track) return locale === 'pt' ? 'Fonte de categorias: página oficial do material NASA' : 'Category source: official NASA material page';
  return locale === 'pt' ? `Fonte dos dados: ${track.label[locale]}` : `Data source: ${track.label[locale]}`;
}

export function MaterialSonificationPanel({ resourceId, locale, resourceSourceUrl }: {
  resourceId: string;
  locale: Locale;
  resourceSourceUrl: string;
}) {
  const profile = getMaterialSonificationProfile(resourceId);
  const copy = materialCopy[locale].sonification;
  const [selectedTrackId, setSelectedTrackId] = useState(profile?.tracks[0]?.id ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(profile?.categories[0]?.id ?? '');
  const track = profile?.tracks.find((item) => item.id === selectedTrackId) ?? profile?.tracks[0];
  const sound = useMaterialSonification(track, locale);

  useEffect(() => {
    setSelectedTrackId(profile?.tracks[0]?.id ?? '');
    setSelectedCategoryId(profile?.categories[0]?.id ?? '');
  }, [resourceId, profile]);

  useEffect(() => {
    if (!profile) return;
    const handlePageAction = (event: WindowEventMap['earthsound:page-action']) => {
      const action = event.detail.action;
      const category = profile.categories.find((item) => item.id === selectedCategoryId) ?? profile.categories[0];
      if (action === 'restart') {
        if (track) sound.restart();
        else if (category) sound.restart(category, category.label[locale]);
        return;
      }
      if (profile.tracks.length > 0 || action !== 'play' || !category) return;
      void sound.previewCategory(category, category.label[locale]);
    };
    window.addEventListener('earthsound:page-action', handlePageAction);
    return () => window.removeEventListener('earthsound:page-action', handlePageAction);
  }, [locale, profile, selectedCategoryId, sound.previewCategory, sound.restart, track]);

  if (!profile) return null;

  const selectedCategory = profile.categories.find((item) => item.id === selectedCategoryId) ?? profile.categories[0];
  const currentPoint = track && sound.step >= 0 ? track.points[sound.step] : undefined;
  const currentPointText = currentPoint
    ? currentPoint.value === null
      ? `${materialSoundText(currentPoint.label, locale)} — ${copy.noValue}`
      : `${materialSoundText(currentPoint.label, locale)}: ${formatValue(currentPoint.value, locale, track?.decimals ?? 2)} ${track ? materialSoundText(track.unit, locale) : ''}`
    : selectedCategory?.label[locale] ?? '—';
  const currentFrequency = sound.frequency ?? (!track && selectedCategory ? selectedCategory.frequencyHz : null);
  const statusText = sound.status === 'unsupported' ? copy.unsupported
    : sound.status === 'playing' ? copy.playing
      : sound.status === 'paused' ? copy.paused
        : sound.status === 'previewing' ? copy.previewing : copy.idle;
  const sourceUrl = track?.sourceUrl ?? resourceSourceUrl;
  const groupedCategories = profile.categories.reduce<Record<string, MaterialSoundCategory[]>>((groups, category) => {
    const heading = category.group?.[locale] ?? copy.categoryHeading;
    groups[heading] = [...(groups[heading] ?? []), category];
    return groups;
  }, {});
  const playOrResume = () => {
    if (sound.status === 'paused') {
      void sound.resume();
    } else if (track) {
      void sound.play();
    } else if (selectedCategory) {
      void sound.previewCategory(selectedCategory, selectedCategory.label[locale]);
    }
  };
  const playLabel = sound.status === 'paused' ? copy.resume : copy.play;
  const isSequenceRunning = sound.status === 'playing' || sound.status === 'previewing';
  const canPlay = Boolean(track?.points.length || selectedCategory);

  return <section className="material-sonification" aria-labelledby="material-sonification-title">
    <div className="material-sonification-heading">
      <div><p className="eyebrow">{locale === 'pt' ? 'EARTHSOUND · DADOS → SOM' : 'EARTHSOUND · DATA → SOUND'}</p><h3 id="material-sonification-title">{copy.title}</h3></div>
      <AudioLines size={19} aria-hidden="true" />
    </div>
    <p className="material-sonification-mode">{profile.modeLabel[locale]}</p>
    <p className="material-sonification-mapping">{profile.mapping[locale]}</p>

    {profile.tracks.length > 1 && <label className="material-sonification-field">
      <span>{copy.track}</span>
      <select value={track?.id ?? ''} onChange={(event) => setSelectedTrackId(event.target.value)}>
        {profile.tracks.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}
      </select>
    </label>}

    {(track || selectedCategory) && <div className="material-sonification-current">
      <span>{copy.currentPoint}</span><strong>{currentPointText}</strong>
      <span>{copy.frequency}</span><strong>{currentFrequency === null ? '—' : `${currentFrequency} Hz`}</strong>
    </div>}

    {track && <div className="material-sonification-progress">
      <progress value={sound.step < 0 ? 0 : sound.step + 1} max={Math.max(1, track.points.length)} aria-label={copy.progress} />
      <span>{sound.step < 0 ? 0 : sound.step + 1} / {track.points.length}</span>
    </div>}

    {(track || selectedCategory) && <>
      <div className="material-sonification-controls" role="group" aria-label={copy.title}>
        <button type="button" className="button button-primary button-small" onClick={playOrResume} disabled={!canPlay || isSequenceRunning}>
          <CirclePlay size={15} aria-hidden="true" />{playLabel}
        </button>
        <button type="button" className="button button-secondary button-small" onClick={sound.pause} disabled={!isSequenceRunning}>
          <CirclePause size={15} aria-hidden="true" />{copy.pause}
        </button>
        <button type="button" className="button button-quiet button-small" onClick={sound.stop} disabled={sound.status === 'idle' || sound.status === 'unsupported'}>
          <Square size={13} aria-hidden="true" />{copy.stop}
        </button>
        <button type="button" className="button button-quiet button-small" onClick={() => track ? sound.restart() : sound.restart(selectedCategory, selectedCategory?.label[locale])} disabled={!canPlay}>
          <RotateCcw size={14} aria-hidden="true" />{copy.restart}
        </button>
      </div>
      <div className="material-sonification-settings">
        <label className="material-sonification-range"><span><Volume2 size={14} aria-hidden="true" />{copy.volume}</span><input type="range" min="0" max="1" step="0.05" value={sound.volume} onChange={(event) => sound.setVolume(Number(event.target.value))} /></label>
        {track && <label className="material-sonification-field"><span>{copy.speed}</span><select value={sound.speed} onChange={(event) => sound.setSpeed(Number(event.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option><option value={4}>4×</option></select></label>}
      </div>
    </>}

    {profile.categories.length > 0 && <div className="material-sonification-categories">
      <h4>{copy.categoryHeading}</h4>
      {Object.entries(groupedCategories).map(([heading, group]) => <div className="material-sonification-category-group" key={heading}>
        <p>{heading}</p>
        <div className="material-sonification-category-list">
          {group.map((category) => <button key={category.id} type="button" className="material-sonification-category" aria-pressed={selectedCategoryId === category.id} onClick={() => {
            setSelectedCategoryId(category.id);
            void sound.previewCategory(category, category.label[locale]);
          }}>
            <AudioLines size={14} aria-hidden="true" /><span><strong>{category.label[locale]}</strong><small>{category.description[locale]}</small></span>
          </button>)}
        </div>
      </div>)}
    </div>}

    <p className="material-sonification-limitation"><strong>{locale === 'pt' ? 'Limite e sincronismo' : 'Limit and synchronization'}:</strong> {profile.limitation[locale]}</p>
    <p className="material-sonification-source"><a href={sourceUrl} target="_blank" rel="noreferrer">{sourceLabel(locale, track)} ↗</a>{track && <span>{locale === 'pt' ? 'Snapshot de dados' : 'Data snapshot'}: {materialSonificationSnapshot.accessed}</span>}</p>
    <p className="material-sonification-original">{copy.originalAudio}</p>
    <p className="material-sonification-status" role="status" aria-live="polite">{statusText}</p>
    <span className="sr-only" aria-live="polite" aria-atomic="true">{sound.announcement}</span>
  </section>;
}
