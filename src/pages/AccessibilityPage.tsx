import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { copy } from '../data/i18n';
import { PageIntro } from '../components/Common';
import { Accessibility, AudioLines, Keyboard, Mic, ScreenShare, Volume2 } from 'lucide-react';
import type { SpeechStatus } from '../hooks/useSpeechSynthesis';
import { identifyVoiceCommand } from '../hooks/useVoiceRecognition';

function readingStatus(locale: 'pt' | 'en', status: SpeechStatus) {
  const messages: Record<SpeechStatus, [string, string]> = {
    idle: ['Leitura parada', 'Reading stopped'],
    speaking: ['Lendo em voz alta', 'Reading aloud'],
    paused: ['Leitura pausada', 'Reading paused'],
    unsupported: ['Leitura em voz alta indisponível neste navegador', 'Read-aloud is unavailable in this browser'],
    error: ['A leitura encontrou um erro', 'Reading encountered an error'],
  };
  return messages[status][locale === 'pt' ? 0 : 1];
}

export function AccessibilityPage() {
  const { locale, settings, updateSetting, volume, setVolume, readPage, speechStatus, pauseSpeech, resumeSpeech, stopSpeech, speak, announce } = useApp();
  const [textCommand, setTextCommand] = useState('');
  const [commandStatus, setCommandStatus] = useState('');
  const ui = copy[locale];
  const access = ui.access;
  const voiceCommands = locale === 'pt'
    ? ['Abrir início', 'Abrir materiais NASA', 'Começar exploração', 'Abrir temperatura', 'Explorar região fria', 'Explorar região quente', 'Ouvir dados', 'Pausar áudio', 'Retomar áudio', 'Parar áudio', 'Pausar leitura', 'Retomar leitura', 'Parar leitura', 'Abrir camada de ozônio', 'Selecionar ano 2018', 'Ler descrição', 'Ler esta página', 'Aumentar volume', 'Diminuir volume', 'Onde estou?', 'Voltar', 'Ajuda']
    : ['Open home', 'Open NASA materials', 'Start exploration', 'Open temperature', 'Explore cold region', 'Explore warm region', 'Play data', 'Pause audio', 'Resume audio', 'Stop audio', 'Pause reading', 'Resume reading', 'Stop reading', 'Open ozone layer', 'Select year 2018', 'Read description', 'Read this page', 'Increase volume', 'Decrease volume', 'Where am I?', 'Go back', 'Help'];
  function runTextCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = identifyVoiceCommand(textCommand);
    if (!command) {
      const message = locale === 'pt' ? 'Comando não reconhecido. Use uma das frases listadas.' : 'Command not recognized. Use one of the listed phrases.';
      setCommandStatus(message);
      announce(message);
      return;
    }
    const confirmation = locale === 'pt' ? `Comando executado: ${textCommand.trim()}` : `Command executed: ${textCommand.trim()}`;
    window.dispatchEvent(new CustomEvent('earthsound:action', { detail: command }));
    setCommandStatus(confirmation);
    announce(confirmation);
    setTextCommand('');
  }
  return <div className="page-wrap accessibility-page">
    <PageIntro eyebrow={access.eyebrow} title={access.title} subtitle={access.subtitle}>
      <div className="speech-toolbar"><button className="button button-primary" type="button" onClick={readPage}>{access.startReading}</button><button className="button button-secondary" type="button" onClick={pauseSpeech} disabled={speechStatus !== 'speaking'}>{access.pauseReading}</button><button className="button button-secondary" type="button" onClick={resumeSpeech} disabled={speechStatus !== 'paused'}>{access.resumeReading}</button><button className="button button-quiet" type="button" onClick={stopSpeech} disabled={speechStatus === 'idle'}>{access.stopReading}</button></div>
      <p className="speech-status-note">{readingStatus(locale, speechStatus)}</p>
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
        <article className="access-info-row"><span className="access-info-icon"><Mic size={20} /></span><div><h2>{access.voiceTitle}</h2><p>{access.voiceText}</p><button type="button" className="button button-small" onClick={() => speak(locale === 'pt' ? ui.voice.commands : ui.voice.commandsEn)}>{locale === 'pt' ? 'Ouvir comandos' : 'Hear commands'}</button><ul className="command-list">{voiceCommands.map((command) => <li key={command}><span className="command-dot" />“{command}”</li>)}</ul><form className="voice-command-form" onSubmit={runTextCommand}><label htmlFor="text-command">{locale === 'pt' ? 'Alternativa sem microfone — digite um comando' : 'Microphone-free alternative — type a command'}</label><div className="voice-command-controls"><input id="text-command" className="text-command-input" value={textCommand} onChange={(event) => setTextCommand(event.target.value)} placeholder={locale === 'pt' ? 'Ex.: abrir temperatura' : 'e.g. open temperature'} autoComplete="off" /><button type="submit" className="button button-small button-primary">{locale === 'pt' ? 'Executar' : 'Run command'}</button></div><p id="text-command-note" className="voice-command-note">{commandStatus || (locale === 'pt' ? 'Usa as mesmas ações do reconhecimento de voz; funciona também no Firefox.' : 'Uses the same actions as speech recognition; also works in Firefox.')}</p></form></div></article>
        <article className="access-info-row"><span className="access-info-icon"><ScreenShare size={20} /></span><div><h2>{access.screenreaderTitle}</h2><p>{access.screenreaderText}</p></div></article>
        <article className="access-info-row"><span className="access-info-icon"><AudioLines size={20} /></span><div><h2>{access.browserTitle}</h2><p>{access.browserText}</p><p className="browser-note">{access.privacyText}</p></div></article>
      </div>
    </div>
  </div>;
}
