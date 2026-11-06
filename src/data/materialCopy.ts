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
}> = {
  pt: {
    eyebrow: 'BIBLIOTECA AUDIOVISUAL · NASA SVS',
    title: 'Imagens em movimento. Dados em contexto.',
    subtitle: 'Explore animações científicas oficiais da NASA. Ouça a explicação em português ou inglês e use os controles do player para acompanhar cada sequência.',
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
    soundNote: 'A sonificação quantitativa só é oferecida onde dados numéricos e sua relação com o som estão documentados. Não estimamos medições pelos pixels.',
    collection: 'Coleção compartilhada', count: '9 recursos NASA', backCatalog: 'Voltar ao catálogo',
  },
  en: {
    eyebrow: 'NASA SVS · AUDIOVISUAL LIBRARY',
    title: 'Moving images. Data in context.',
    subtitle: 'Explore official NASA scientific visualizations. Hear an explanation in Portuguese or English and use the player controls to follow each sequence.',
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
    soundNote: 'Quantitative sonification is offered only where numerical data and its mapping to sound are documented. We do not estimate measurements from pixels.',
    collection: 'Shared collection', count: '9 NASA resources', backCatalog: 'Back to catalog',
  },
};
