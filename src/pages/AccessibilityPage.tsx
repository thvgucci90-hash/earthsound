import { useApp } from '../context/AppContext';
import { copy } from '../data/i18n';
import { PageIntro } from '../components/Common';
import { Accessibility, AudioLines, Keyboard, Mic, ScreenShare, Volume2 } from 'lucide-react';

export function AccessibilityPage() {
  const { locale, settings, updateSetting, volume, setVolume, speak, pauseSpeech, resumeSpeech, stopSpeech } = useApp();
  const ui = copy[locale];
  const access = ui.access;
  const voiceCommands = locale === 'pt'
    ? ['Abrir início', 'Começar exploração', 'Abrir temperatura', 'Explorar região fria', 'Explorar região quente', 'Ouvir dados', 'Pausar áudio', 'Retomar áudio', 'Parar áudio', 'Abrir camada de ozônio', 'Selecionar ano 2018', 'Ler descrição', 'Aumentar volume', 'Diminuir volume', 'Onde estou?', 'Voltar', 'Ajuda']
    : ['Open home', 'Start exploration', 'Open temperature', 'Explore cold region', 'Explore warm region', 'Play data', 'Pause audio', 'Resume audio', 'Stop audio', 'Open ozone layer', 'Select year 2018', 'Read description', 'Increase volume', 'Decrease volume', 'Where am I?', 'Go back', 'Help'];
  const pageSpeech = `${access.title}. ${access.subtitle}. ${access.keyboardText}. ${access.browserText}`;
  return <div className="page-wrap accessibility-page">
    <PageIntro eyebrow={access.eyebrow} title={access.title} subtitle={access.subtitle}>
      <div className="speech-toolbar"><button className="button button-primary" type="button" onClick={() => speak(pageSpeech)}>{access.startReading}</button><button className="button button-secondary" type="button" onClick={pauseSpeech}>{access.pauseReading}</button><button className="button button-secondary" type="button" onClick={resumeSpeech}>{access.resumeReading}</button><button className="button button-quiet" type="button" onClick={stopSpeech}>{access.stopReading}</button></div>
    </PageIntro>
    <div className="access-layout">
      <section className="access-settings-panel" aria-labelledby="preferences-title"><p className="eyebrow"><Accessibility size={14} /> {locale === 'pt' ? 'PREFERÊNCIAS LOCAIS' : 'LOCAL PREFERENCES'}</p><h2 id="preferences-title">{locale === 'pt' ? 'Adapte a interface' : 'Adjust the interface'}</h2>
        <label className="setting-row"><span>{access.contrast}</span><input type="checkbox" checked={settings.highContrast} onChange={(e) => updateSetting('highContrast', e.target.checked)} /></label>
        <label className="setting-row"><span>{access.largeText}</span><input type="checkbox" checked={settings.largeText} onChange={(e) => updateSetting('largeText', e.target.checked)} /></label>
        <label className="setting-row"><span>{access.reducedMotion}</span><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSetting('reducedMotion', e.target.checked)} /></label>
        <label className="range-setting"><span><Volume2 size={16} /> {ui.common.volume}</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label={ui.common.volume} /><output>{Math.round(volume * 100)}%</output></label>
      </section>
      <div className="access-info-list">
        <article className="access-info-row"><span className="access-info-icon"><Keyboard size={20} /></span><div><h2>{access.keyboardTitle}</h2><p>{access.keyboardText}</p><kbd>Tab</kbd> <kbd>Shift + Tab</kbd> <kbd>Enter</kbd> <kbd>Espaço / Space</kbd> <kbd>Esc</kbd></div></article>
        <article className="access-info-row"><span className="access-info-icon"><Mic size={20} /></span><div><h2>{access.voiceTitle}</h2><p>{access.voiceText}</p><button type="button" className="button button-small" onClick={() => speak(locale === 'pt' ? ui.voice.commands : ui.voice.commandsEn)}>{locale === 'pt' ? 'Ouvir comandos' : 'Hear commands'}</button><ul className="command-list">{voiceCommands.map((command) => <li key={command}><span className="command-dot" />“{command}”</li>)}</ul></div></article>
        <article className="access-info-row"><span className="access-info-icon"><ScreenShare size={20} /></span><div><h2>{access.screenreaderTitle}</h2><p>{access.screenreaderText}</p></div></article>
        <article className="access-info-row"><span className="access-info-icon"><AudioLines size={20} /></span><div><h2>{access.browserTitle}</h2><p>{access.browserText}</p><p className="browser-note">{access.privacyText}</p></div></article>
      </div>
    </div>
  </div>;
}
