import type { Locale } from './i18n';
import { materialSonificationSnapshot } from './materialSonificationSeries';

export type MaterialSoundText = string | Record<Locale, string>;
export type MaterialSoundPoint = { label: MaterialSoundText; value: number | null; detail?: MaterialSoundText };
export type MaterialSoundTrack = {
  id: string;
  label: Record<Locale, string>;
  unit: MaterialSoundText;
  points: MaterialSoundPoint[];
  sourceUrl: string;
  mapping: Record<Locale, string>;
  domain?: readonly [number, number];
  decimals?: number;
};
export type MaterialSoundCategory = {
  id: string;
  group?: Record<Locale, string>;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  frequencyHz: number;
  waveform: OscillatorType;
};
export type MaterialSonificationProfile = {
  kind: 'series' | 'summary' | 'qualitative' | 'mixed';
  modeLabel: Record<Locale, string>;
  mapping: Record<Locale, string>;
  limitation: Record<Locale, string>;
  tracks: MaterialSoundTrack[];
  categories: MaterialSoundCategory[];
};

export function materialSoundText(value: MaterialSoundText, locale: Locale): string {
  return typeof value === 'string' ? value : value[locale];
}

const series = materialSonificationSnapshot.series as unknown as Record<string, MaterialSoundPoint[]>;
const ozoneWatch = 'https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html';
const gistemp = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv';
const noaaCo2 = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv';

export const materialSonificationProfiles: Record<string, MaterialSonificationProfile> = {
  'ozone-min': {
    kind: 'series',
    modeLabel: { pt: 'Série quantitativa · mínimo anual NASA Ozone Watch', en: 'Quantitative series · NASA Ozone Watch annual minimum' },
    mapping: {
      pt: 'Um pulso por ano. O mínimo anual em DU mais alto produz um tom mais alto; a frequência é normalizada pelos extremos desta série e não é uma escala física NASA.',
      en: 'One pulse per year. A higher annual minimum in DU produces a higher pitch; frequency is normalized to this series’ endpoints and is not a NASA physical scale.',
    },
    limitation: {
      pt: 'Série anual publicada pela NASA Ozone Watch, não uma extração dos quadros do vídeo. 1995 não tem registro; esse intervalo permanece em silêncio. A legenda do vídeo informa um intervalo final diferente do título.',
      en: 'Annual series published by NASA Ozone Watch, not extracted from video frames. 1995 has no record and remains silent. The video caption gives a different end year than its title.',
    },
    tracks: [{
      id: 'minimum-ozone',
      label: { pt: 'Mínimo diário anual de ozônio', en: 'Annual daily minimum ozone' },
      unit: 'DU',
      points: series.ozoneAnnualMinimum ?? [],
      sourceUrl: ozoneWatch,
      mapping: { pt: 'Mínimo em DU → altura do tom; valores ausentes → silêncio.', en: 'Minimum in DU → pitch; missing values → silence.' },
      decimals: 0,
    }],
    categories: [],
  },
  'ozone-sequence': {
    kind: 'series',
    modeLabel: { pt: 'Séries quantitativas companheiras · extremos anuais', en: 'Companion quantitative series · annual extremes' },
    mapping: {
      pt: 'Selecione uma variável. DU e área usam trilhas distintas. Valores ausentes não são preenchidos; a série do Ozone Watch não é declarada como a correspondência quadro a quadro do filme Smithsonian.',
      en: 'Select a variable. DU and area use separate tracks. Missing values are not filled; Ozone Watch is not claimed as the Smithsonian film’s frame-by-frame data.',
    },
    limitation: {
      pt: 'Valores anuais do NASA Ozone Watch, relacionados ao tema do vídeo, mas não apresentados pela SVS como a tabela exata que gerou seus quadros. Área abaixo do limiar de 220 DU e mínimo de ozônio são métricas diferentes.',
      en: 'Annual NASA Ozone Watch values related to the video topic, but not identified by SVS as the exact table used for its frames. Area below the 220 DU threshold and minimum ozone are different metrics.',
    },
    tracks: [
      {
        id: 'annual-minimum',
        label: { pt: 'Mínimo diário anual de ozônio', en: 'Annual daily minimum ozone' },
        unit: 'DU', points: series.ozoneSequenceAnnualMinimum ?? [], sourceUrl: ozoneWatch,
        mapping: { pt: 'Mínimo em DU → altura do tom; valores ausentes → silêncio.', en: 'Minimum in DU → pitch; missing values → silence.' }, decimals: 0,
      },
      {
        id: 'annual-area',
        label: { pt: 'Área máxima diária do buraco', en: 'Maximum daily ozone-hole area' },
        unit: { pt: 'milhões de km²', en: 'million km²' }, points: series.ozoneSequenceAnnualMaximumArea ?? [], sourceUrl: ozoneWatch,
        mapping: { pt: 'Área máxima em milhões de km² → altura do tom em uma trilha própria; a unidade aparece junto ao valor.', en: 'Maximum area in million km² → pitch in its own track; the unit remains visible with the value.' }, decimals: 1,
      },
    ],
    categories: [],
  },
  greenland: {
    kind: 'mixed',
    modeLabel: { pt: 'Resumo quantitativo + legenda qualitativa', en: 'Quantitative summary + qualitative legend' },
    mapping: {
      pt: 'O tom do único resumo publicado representa a magnitude aproximada de perda média (280 Gt/ano); a convenção de sinal para perda e a faixa auditiva são escolhas EarthSound. Botões separados reproduzem as três classes documentadas da legenda.',
      en: 'The single published summary tone represents the approximate mean loss magnitude (280 Gt/year); the loss sign convention and listening range are EarthSound choices. Separate buttons preview the three documented legend classes.',
    },
    limitation: {
      pt: 'A página consultada não fornece uma série anual numérica para os anos do vídeo. O resumo médio não é uma série temporal; a paleta de perda/ganho/estabilidade é interpretativa e não mede pixels.',
      en: 'The consulted page does not provide a yearly numerical series for the video period. The mean summary is not a time series; the loss/gain/stability palette is interpretive and does not measure pixels.',
    },
    tracks: [{
      id: 'mass-loss-summary',
      label: { pt: 'Perda média de massa descrita pela NASA (2002–2016)', en: 'NASA-reported mean mass loss (2002–2016)' },
      unit: { pt: 'Gt/ano', en: 'Gt/year' },
      points: [{ label: '2002–2016', value: 280, detail: 'Magnitude of approximate annual mean loss; NASA SVS summary.' }],
      sourceUrl: 'https://svs.gsfc.nasa.gov/30879/',
      mapping: { pt: 'Magnitude em Gt/ano → altura; 0–400 Gt/ano é faixa auditiva EarthSound, não escala NASA.', en: 'Magnitude in Gt/year → pitch; 0–400 Gt/year is an EarthSound listening range, not a NASA scale.' },
      domain: [0, 400], decimals: 0,
    }],
    categories: [
      { id: 'loss', group: { pt: 'Legenda espacial NASA', en: 'NASA spatial legend' }, label: { pt: 'Perda de massa · laranja/vermelho', en: 'Mass loss · orange/red' }, description: { pt: 'Som grave e pulsante; tradução qualitativa da classe de perda.', en: 'Low, pulsing sound; qualitative rendering of the loss class.' }, frequencyHz: 220, waveform: 'triangle' },
      { id: 'gain', group: { pt: 'Legenda espacial NASA', en: 'NASA spatial legend' }, label: { pt: 'Ganho de massa · azul-claro', en: 'Mass gain · light blue' }, description: { pt: 'Som mais claro e sustentado; tradução qualitativa da classe de ganho.', en: 'Brighter sustained sound; qualitative rendering of the gain class.' }, frequencyHz: 440, waveform: 'sine' },
      { id: 'stable', group: { pt: 'Legenda espacial NASA', en: 'NASA spatial legend' }, label: { pt: 'Pouca mudança · branco', en: 'Little change · white' }, description: { pt: 'Pulso curto e suave; tradução qualitativa da classe de pouca mudança.', en: 'Short, soft pulse; qualitative rendering of the little-change class.' }, frequencyHz: 330, waveform: 'sine' },
    ],
  },
  co2: {
    kind: 'series',
    modeLabel: { pt: 'Série quantitativa · NOAA Mauna Loa', en: 'Quantitative series · NOAA Mauna Loa' },
    mapping: {
      pt: 'Cada pulso é uma média mensal observada em Mauna Loa. CO₂ mais alto em ppm eleva o tom; este perfil não sonifica os traços separados de Polo Sul ou AIRS/AMSU do vídeo.',
      en: 'Each pulse is an observed monthly mean at Mauna Loa. Higher CO₂ in ppm raises pitch; this profile does not sonify the separate South Pole or AIRS/AMSU traces in the video.',
    },
    limitation: {
      pt: 'Período de 1980 a setembro de 2014, correspondente ao recorte descrito pela NASA. A série NOAA é um registro terrestre independente, não uma leitura dos pixels nem uma reconstrução de todos os traços do vídeo.',
      en: 'Period: 1980 through September 2014, matching the span described by NASA. The NOAA series is an independent ground record, not a pixel reading or reconstruction of every trace in the video.',
    },
    tracks: [{
      id: 'mauna-loa-monthly',
      label: { pt: 'Média mensal em Mauna Loa', en: 'Monthly mean at Mauna Loa' }, unit: 'ppm',
      points: series.co2MaunaLoaMonthly ?? [], sourceUrl: noaaCo2,
      mapping: { pt: 'Média mensal em ppm → altura do tom; cada evento preserva o mês publicado.', en: 'Monthly mean in ppm → pitch; each event keeps its published month.' }, decimals: 2,
    }],
    categories: [],
  },
  biosphere: {
    kind: 'qualitative',
    modeLabel: { pt: 'Legenda qualitativa · sem série harmonizada dos quadros', en: 'Qualitative legend · no harmonized frame series' },
    mapping: {
      pt: 'Escolha uma categoria para ouvir seu timbre. Clorofila oceânica e NDVI terrestre são variáveis e escalas diferentes; os timbres são símbolos da legenda, não valores ou proporções.',
      en: 'Choose a category to hear its timbre. Ocean chlorophyll and land NDVI are different variables and scales; the timbres are legend symbols, not values or proportions.',
    },
    limitation: {
      pt: 'A NASA apresenta categorias de cor, mas não uma tabela numérica única com valores por quadro. Não inferimos concentração ou NDVI pela cor dos pixels.',
      en: 'NASA presents color categories, not a single numerical table with values per frame. We do not infer chlorophyll or NDVI from pixel colors.',
    },
    tracks: [],
    categories: [
      { id: 'ocean-low', group: { pt: 'Oceano · clorofila (mg/m³)', en: 'Ocean · chlorophyll (mg/m³)' }, label: { pt: 'Classe baixa · azul/violeta', en: 'Lower class · blue/violet' }, description: { pt: 'Timbre baixo e suave, símbolo qualitativo.', en: 'Low, soft timbre, a qualitative symbol.' }, frequencyHz: 220, waveform: 'sine' },
      { id: 'ocean-high', group: { pt: 'Oceano · clorofila (mg/m³)', en: 'Ocean · chlorophyll (mg/m³)' }, label: { pt: 'Classe mais alta · verde/vermelho', en: 'Higher class · green/red' }, description: { pt: 'Timbre mais agudo e brilhante, símbolo qualitativo.', en: 'Brighter, higher timbre, a qualitative symbol.' }, frequencyHz: 660, waveform: 'triangle' },
      { id: 'land-low', group: { pt: 'Terra · NDVI (sem unidade)', en: 'Land · NDVI (unitless)' }, label: { pt: 'Vegetação escassa/ausente · castanho/branco', en: 'Sparse/absent vegetation · brown/white' }, description: { pt: 'Pulso curto e discreto, símbolo qualitativo.', en: 'Short, quiet pulse, a qualitative symbol.' }, frequencyHz: 294, waveform: 'triangle' },
      { id: 'land-high', group: { pt: 'Terra · NDVI (sem unidade)', en: 'Land · NDVI (unitless)' }, label: { pt: 'Vegetação abundante · verde', en: 'Abundant vegetation · green' }, description: { pt: 'Timbre sustentado, símbolo qualitativo.', en: 'Sustained timbre, a qualitative symbol.' }, frequencyHz: 523, waveform: 'sine' },
    ],
  },
  amazon: {
    kind: 'qualitative',
    modeLabel: { pt: 'Legenda qualitativa · categorias visuais NASA', en: 'Qualitative legend · NASA visual categories' },
    mapping: {
      pt: 'Cada botão toca um timbre para uma categoria descrita pela NASA. São símbolos sonoros interpretativos; não codificam área, taxa de desmatamento nem quantidade de pixels.',
      en: 'Each button plays a timbre for a category described by NASA. These are interpretive sound symbols; they do not encode area, deforestation rate or pixel counts.',
    },
    limitation: {
      pt: 'O material mostra Rondônia e não publica valores numéricos ou datas por quadro. As categorias podem ser ouvidas separadamente, sem alegação de sincronismo com uma região/instante do vídeo.',
      en: 'The material shows Rondônia and publishes no numerical values or per-frame dates. Categories can be heard separately, without claiming synchronization to a region or instant in the video.',
    },
    tracks: [],
    categories: [
      { id: 'intact-forest', label: { pt: 'Floresta intacta · verde-escuro', en: 'Intact forest · dark green' }, description: { pt: 'Timbre grave contínuo, símbolo qualitativo de floresta intacta.', en: 'Low sustained timbre, a qualitative symbol for intact forest.' }, frequencyHz: 196, waveform: 'sine' },
      { id: 'open-soil', label: { pt: 'Área aberta/solo exposto · castanho', en: 'Open/bare ground · brown' }, description: { pt: 'Pulso seco e curto, símbolo qualitativo de área aberta.', en: 'Short, dry pulse, a qualitative symbol for open ground.' }, frequencyHz: 330, waveform: 'triangle' },
      { id: 'crops-pasture', label: { pt: 'Culturas/pastagens · verde-claro', en: 'Crops/pasture · light green' }, description: { pt: 'Timbre mais claro, símbolo qualitativo de culturas/pastagens.', en: 'Brighter timbre, a qualitative symbol for crops/pasture.' }, frequencyHz: 494, waveform: 'sine' },
    ],
  },
  agriculture: {
    kind: 'summary',
    modeLabel: { pt: 'Resumo quantitativo · projeções globais de fim de século', en: 'Quantitative summary · end-of-century global projections' },
    mapping: {
      pt: 'Dois eventos representam os resumos publicados pela NASA sob SSP5-8.5: milho −24% e trigo aproximadamente +17%. O domínio −40% a +40% segue a legenda do mapa; não há interpolação anual.',
      en: 'Two events represent NASA’s published summaries under SSP5-8.5: maize −24% and wheat about +17%. The −40% to +40% domain follows the map legend; no annual interpolation is used.',
    },
    limitation: {
      pt: 'São projeções condicionais de modelos, não observações. O artigo científico cita aproximadamente +18% para trigo; o perfil usa os +17% apresentados pela página NASA SVS.',
      en: 'These are conditional model projections, not observations. The paper reports about +18% for wheat; this profile uses the +17% shown on the NASA SVS page.',
    },
    tracks: [{
      id: 'yield-end-century',
      label: { pt: 'Variação global projetada do rendimento', en: 'Projected global yield change' }, unit: '%',
      points: [
        { label: { pt: 'Milho · SSP5-8.5 · fim do século', en: 'Maize · SSP5-8.5 · end of century' }, value: -24 },
        { label: { pt: 'Trigo · SSP5-8.5 · fim do século', en: 'Wheat · SSP5-8.5 · end of century' }, value: 17 },
      ],
      sourceUrl: 'https://svs.gsfc.nasa.gov/4974/',
      mapping: { pt: 'Variação percentual dentro da legenda −40% a +40% → altura do tom; um pulso por cultura.', en: 'Percentage change within the −40% to +40% map legend → pitch; one pulse per crop.' },
      domain: [-40, 40], decimals: 0,
    }],
    categories: [],
  },
  temperature: {
    kind: 'series',
    modeLabel: { pt: 'Série quantitativa associada · média global GISTEMP', en: 'Associated quantitative series · GISTEMP global mean' },
    mapping: {
      pt: 'Um pulso por janela móvel de cinco anos. Anomalias globais em °C acima da referência sobem de tom; o zero representa a referência 1951–1980. A faixa auditiva −1,5°C a +1,5°C é uma convenção EarthSound.',
      en: 'One pulse per five-year rolling window. Global anomalies in °C above the baseline rise in pitch; zero is the 1951–1980 reference. The −1.5°C to +1.5°C listening range is an EarthSound convention.',
    },
    limitation: {
      pt: 'Esta é a média global anual GISTEMP agrupada em janelas de cinco anos, não o campo espacial nem uma sonificação dos pixels do mapa. A sequência segue a ordem dos períodos exibidos, sem afirmar sincronismo com quadros individuais.',
      en: 'This is the GISTEMP annual global mean grouped into five-year windows, not the spatial field or a sonification of map pixels. The sequence follows the displayed period order without claiming synchronization to individual frames.',
    },
    tracks: [{
      id: 'global-five-year-mean',
      label: { pt: 'Anomalia média global móvel de cinco anos', en: 'Five-year rolling global-mean anomaly' }, unit: { pt: '°C de anomalia', en: '°C anomaly' },
      points: series.temperatureGistempFiveYearRollingMean ?? [], sourceUrl: gistemp,
      mapping: { pt: 'Anomalia em °C → altura; 0°C fica no centro da faixa de frequência configurada.', en: 'Anomaly in °C → pitch; 0°C sits at the center of the configured frequency range.' },
      domain: [-1.5, 1.5], decimals: 2,
    }],
    categories: [],
  },
  'climate-spiral': {
    kind: 'series',
    modeLabel: { pt: 'Série quantitativa · GISTEMP mensal global', en: 'Quantitative series · global monthly GISTEMP' },
    mapping: {
      pt: 'Cada mês publicado produz um evento. Anomalias em °C maiores sobem de tom; zero é a referência 1951–1980. A faixa −1,5°C a +1,5°C é uma convenção auditiva EarthSound, não escala NASA.',
      en: 'Each published month produces an event. Higher anomalies in °C rise in pitch; zero is the 1951–1980 baseline. The −1.5°C to +1.5°C range is an EarthSound listening convention, not a NASA scale.',
    },
    limitation: {
      pt: 'A série é global e mensal, não tem distribuição geográfica. A reprodução é independente do vídeo: a NASA não publica timecodes que associem cada nota a um quadro da espiral. Meses ausentes permanecem silenciosos.',
      en: 'The series is global and monthly, with no geographic distribution. Playback is independent of the video: NASA does not publish timecodes matching each note to a spiral frame. Missing months remain silent.',
    },
    tracks: [{
      id: 'global-monthly-anomaly',
      label: { pt: 'Anomalia mensal global', en: 'Global monthly anomaly' }, unit: { pt: '°C de anomalia', en: '°C anomaly' },
      points: series.climateSpiralGistempMonthly ?? [], sourceUrl: gistemp,
      mapping: { pt: 'Anomalia mensal em °C → altura do tom; valores ausentes → silêncio.', en: 'Monthly anomaly in °C → pitch; missing values → silence.' },
      domain: [-1.5, 1.5], decimals: 2,
    }],
    categories: [],
  },
};

export function getMaterialSonificationProfile(id: string): MaterialSonificationProfile | undefined {
  return materialSonificationProfiles[id];
}
