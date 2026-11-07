import type { Locale } from './i18n';

export const materialCopy: Record<Locale, {
  eyebrow: string; title: string; subtitle: string; selected: string; source: string;
  categories: Record<'all' | 'ozone' | 'ice' | 'atmosphere' | 'biosphere' | 'land' | 'agriculture' | 'climate', string>;
  period: string; variable: string; audio: string; nativeAudio: string; narration: string;
  audioPresent: string; audioAbsent: string; audioUnverified: string;
  narrationNote: string; listen: string; pauseNarration: string; resumeNarration: string; stopNarration: string; play: string; pause: string; stop: string;
  playbackRate: string; choose: string; previous: string; next: string; loading: string;
  mediaUnavailable: string; retry: string; openSource: string; description: string; mediaAlternative: string;
  soundNote: string; collection: string; count: string; backCatalog: string;
  sonification: {
    title: string; play: string; pause: string; resume: string; stop: string; restart: string;
    volume: string; speed: string; track: string; currentPoint: string; frequency: string; progress: string;
    categoryHeading: string; categoryAction: string; originalAudio: string; unsupported: string;
    noValue: string; idle: string; playing: string; paused: string; previewing: string; completed: string;
  };
}> = {
  pt: {
    eyebrow: 'BIBLIOTECA AUDIOVISUAL · NASA SVS',
    title: 'Imagens em movimento. Dados em contexto.',
    subtitle: 'Explore animações científicas oficiais da NASA. Cada material traz uma camada sonora EarthSound com fonte e mapeamento visíveis; use os controles do vídeo e do som separadamente.',
    selected: 'Mídia selecionada', source: 'NASA Scientific Visualization Studio',
    categories: { all: 'Todas', ozone: 'Ozônio', ice: 'Gelo e nível do mar', atmosphere: 'Atmosfera', biosphere: 'Biosfera', land: 'Terra e florestas', agriculture: 'Agricultura', climate: 'Clima e temperatura' },
    period: 'Período', variable: 'Variáveis e unidades', audio: 'Faixa de áudio', nativeAudio: 'Áudio do arquivo NASA', narration: 'Narração EarthSound',
    audioPresent: 'Faixa de áudio presente no arquivo NASA (verificada); o conteúdo não foi transcrito.',
    audioAbsent: 'O arquivo de vídeo consultado não contém faixa de áudio. Narração EarthSound disponível.',
    audioUnverified: 'Faixa de áudio não verificada; use o player para conferir.',
    narrationNote: 'A explicação falada é uma alternativa de acessibilidade criada pelo EarthSound; não faz parte da mídia NASA.',
    pauseNarration: 'Pausar narração', resumeNarration: 'Retomar narração', stopNarration: 'Interromper narração',
    listen: 'Ouvir explicação', play: 'Reproduzir vídeo', pause: 'Pausar vídeo', stop: 'Parar e voltar ao início',
    playbackRate: 'Velocidade do vídeo', choose: 'Abrir material', previous: 'Material anterior', next: 'Próximo material',
    loading: 'Carregando mídia da NASA…', mediaUnavailable: 'A mídia não carregou. Consulte a fonte oficial ou tente novamente.',
    retry: 'Tentar novamente', openSource: 'Abrir a página oficial NASA', description: 'Descrição e contexto',
    mediaAlternative: 'Player de vídeo NASA. Se não for compatível, use o link da fonte oficial.',
    soundNote: 'Todos os nove materiais agora têm uma experiência sonora. Séries verificadas são quantitativas; legendas sem série numérica recebem timbres qualitativos. Nenhum valor é inferido dos pixels, e o som EarthSound permanece separado do áudio original NASA.',
    collection: 'Coleção compartilhada', count: '9 recursos NASA', backCatalog: 'Voltar ao catálogo',
    sonification: {
      title: 'Sonificação EarthSound', play: 'Ouvir sonificação', pause: 'Pausar som', resume: 'Retomar som', stop: 'Parar som', restart: 'Reiniciar som',
      volume: 'Volume da sonificação', speed: 'Velocidade da série', track: 'Variável sonora', currentPoint: 'Evento atual', frequency: 'Frequência', progress: 'Progresso da sonificação',
      categoryHeading: 'Timbres da legenda', categoryAction: 'Ouvir categoria', originalAudio: 'A faixa original NASA continua separada e é controlada no player de vídeo.',
      unsupported: 'Este navegador não iniciou a Web Audio API. A descrição e os valores continuam disponíveis em texto.',
      noValue: 'Sem valor numérico publicado neste ponto; não é produzido tom.', idle: 'Pronto', playing: 'Sonificação em reprodução', paused: 'Sonificação pausada', previewing: 'Prévia de categoria em reprodução', completed: 'Sequência concluída',
    },
  },
  en: {
    eyebrow: 'NASA SVS · AUDIOVISUAL LIBRARY',
    title: 'Moving images. Data in context.',
    subtitle: 'Explore official NASA scientific visualizations. Every item includes an EarthSound layer with its source and mapping shown; control the video and sound separately.',
    selected: 'Selected media', source: 'NASA Scientific Visualization Studio',
    categories: { all: 'All', ozone: 'Ozone', ice: 'Ice and sea level', atmosphere: 'Atmosphere', biosphere: 'Biosphere', land: 'Land and forests', agriculture: 'Agriculture', climate: 'Climate and temperature' },
    period: 'Period', variable: 'Variables and units', audio: 'Audio track', nativeAudio: 'NASA file audio', narration: 'EarthSound narration',
    audioPresent: 'An audio track is present in the NASA file (verified); its contents have not been transcribed.',
    audioAbsent: 'The video file checked has no audio track. EarthSound narration is available.',
    audioUnverified: 'Audio track not verified; use the player to check.',
    narrationNote: 'Spoken explanation is an accessibility alternative created by EarthSound; it is not part of the NASA media.',
    pauseNarration: 'Pause narration', resumeNarration: 'Resume narration', stopNarration: 'Stop narration',
    listen: 'Hear explanation', play: 'Play video', pause: 'Pause video', stop: 'Stop and return to start',
    playbackRate: 'Video playback speed', choose: 'Open material', previous: 'Previous material', next: 'Next material',
    loading: 'Loading NASA media…', mediaUnavailable: 'The media could not be loaded. Visit the official source or try again.',
    retry: 'Try again', openSource: 'Open the official NASA page', description: 'Description and context',
    mediaAlternative: 'NASA video player. If it is unsupported, use the official source link.',
    soundNote: 'All nine materials now have a sound experience. Verified series are quantitative; legends without a numeric series use qualitative timbres. No values are inferred from pixels, and EarthSound remains separate from original NASA audio.',
    collection: 'Shared collection', count: '9 NASA resources', backCatalog: 'Back to catalog',
    sonification: {
      title: 'EarthSound sonification', play: 'Play sonification', pause: 'Pause sound', resume: 'Resume sound', stop: 'Stop sound', restart: 'Restart sound',
      volume: 'Sonification volume', speed: 'Series speed', track: 'Sound variable', currentPoint: 'Current event', frequency: 'Frequency', progress: 'Sonification progress',
      categoryHeading: 'Legend timbres', categoryAction: 'Hear category', originalAudio: 'The original NASA audio remains separate and is controlled in the video player.',
      unsupported: 'This browser could not start the Web Audio API. Descriptions and values remain available as text.',
      noValue: 'No numerical value is published for this point; no tone is produced.', idle: 'Ready', playing: 'Sonification playing', paused: 'Sonification paused', previewing: 'Category preview playing', completed: 'Sequence complete',
    },
  },
};
