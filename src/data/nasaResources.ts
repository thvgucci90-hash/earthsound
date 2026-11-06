import type { Locale } from './i18n';

export type MaterialCategory = 'ozone' | 'ice' | 'atmosphere' | 'biosphere' | 'land' | 'agriculture' | 'climate';
export type NASAResource = {
  id: string;
  title: string;
  category: MaterialCategory;
  period: string;
  description: Record<Locale, string>;
  variables: Record<Locale, string>;
  caution: Record<Locale, string>;
  pageUrl: string;
  mediaUrl: string;
  mediaType: 'video/mp4' | 'video/webm';
  posterUrl: string;
  audioStatus: 'unverified' | 'present' | 'absent';
  mediaDimensions?: string;
  dataSource?: string;
};

// NASA SVS titles, player assets and scientific context audited against each cited source page.
// Audio track presence for each exact media file was checked with ffprobe; no speech transcript is claimed.
export const nasaResources: NASAResource[] = [
  {
    id: 'ozone-min', title: 'Ozone Minimum Concentrations, 1979–2018', category: 'ozone',
    period: '1979–2018 (the video caption instead says 1979–2016)',
    description: {
      pt: 'Globos mostram o dia em que a concentração mínima de ozônio foi atingida sobre a Antártida em cada ano. A fonte dos dados indicada pela NASA é o NASA Ozone Watch. A página descreve estabilização relativa dos níveis globais desde meados dos anos 1990 e o contexto do Protocolo de Montreal.',
      en: 'Globes show the day the minimum ozone concentration was reached over Antarctica in each year. NASA identifies NASA Ozone Watch as the data source. The page describes relative stabilization of global ozone levels since the mid-1990s and the context of the Montreal Protocol.',
    },
    variables: {
      pt: 'Mínimo diário de ozônio; escala em Dobson Units (DU), com a data/ano do mínimo.',
      en: 'Daily minimum ozone; scale in Dobson Units (DU), with the date/year of the minimum.',
    },
    caution: {
      pt: 'A página detalhada e o título dizem 1979–2018, mas a legenda do vídeo diz 1979–2016. A animação mostra o mínimo de cada ano, não a evolução contínua dentro do ano.',
      en: 'The detailed page and title say 1979–2018, but the video caption says 1979–2016. The animation shows each year’s minimum, not continuous within-year change.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/30889/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030889/annual_ozone_min_v4_daily_720p.mp4',
    mediaType: 'video/mp4',
    posterUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030889/annual_ozone_min_v4_daily_1080p.00001_print.jpg',
    audioStatus: 'absent', mediaDimensions: '1280 × 720', dataSource: 'NASA Ozone Watch',
  },
  {
    id: 'ozone-sequence', title: 'Smithsonian Exhibit: Antarctic Ozone Sequence 1979 through 2004', category: 'ozone',
    period: '1979–2004 title; selected Ozone Depth/Size records begin in 1996',
    description: {
      pt: 'Animação de ozônio total na região antártica e de profundidade/tamanho do esgotamento. A NASA explica que o “buraco” é uma região de forte depleção, não ausência completa de ozônio. A página reporta mínimo de 82 DU em 26 de setembro de 2003 e área máxima de 29 milhões de km² em 9 de setembro de 2000.',
      en: 'Animation of total ozone over Antarctica and the depth/size of depletion. NASA explains that the “hole” is a region of strong depletion, not an area with no ozone. The page reports a minimum of 82 DU on September 26, 2003 and a maximum area of 29 million km² on September 9, 2000.',
    },
    variables: {
      pt: 'Ozônio total e mínimo em Dobson Units (DU); profundidade e tamanho/área do esgotamento. A área máxima citada é da página NASA.',
      en: 'Total ozone and minimum in Dobson Units (DU); depletion depth and size/area. The cited maximum area comes from the NASA page.',
    },
    caution: {
      pt: 'A página registra lacunas removidas em 1998, 2002 e 2003; os conjuntos Ozone Depth/Size indicados começam em 1996. O “buraco” não significa ausência total de ozônio.',
      en: 'The page reports data dropouts removed in 1998, 2002 and 2003; listed Ozone Depth/Size data begin in 1996. “Hole” does not mean ozone is entirely absent.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/3264/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a003200/a003264/ozone_NTSC.webmhd.webm',
    mediaType: 'video/webm', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a003200/a003264/ozone7422.jpg',
    audioStatus: 'absent', mediaDimensions: '960 × 540', dataSource: 'NASA TOMS / Earth Probe',
  },
  {
    id: 'greenland', title: 'Greenland Ice Loss 2002–2016', category: 'ice', period: '2002–2016',
    description: {
      pt: 'Visualização de mudanças na massa de gelo da Groenlândia estimadas com observações GRACE da NASA e do Centro Aeroespacial Alemão. A descrição da página estima perda média de aproximadamente 280 gigatoneladas de gelo por ano entre 2002 e 2016 e mostra regiões de perda e ganho.',
      en: 'Visualization of Greenland ice-mass changes estimated from NASA and German Aerospace Center GRACE observations. The page describes average ice loss of approximately 280 gigatons per year between 2002 and 2016 and shows regions of loss and gain.',
    },
    variables: {
      pt: 'Mudança de massa; cores indicam perda/ganho. A página cita até 4 m de altura equivalente de água perdida em algumas áreas no período; não é espessura literal de gelo.',
      en: 'Mass change; colors indicate loss/gain. The page cites up to 4 m of equivalent water height lost in some areas over the period; this is not literal ice thickness.',
    },
    caution: {
      pt: 'Estimativa histórica baseada em GRACE até 2016, não observação atual. A unidade em metros é altura equivalente de água. A própria NASA aponta para versão mais recente.',
      en: 'Historical GRACE-based estimate through 2016, not a current observation. The meter unit is equivalent water height. NASA itself points to a newer version.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/30879/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030879/grace_greenland_720p.mp4',
    mediaType: 'video/mp4', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030879/grace_greenland_201608_print.jpg',
    audioStatus: 'absent', mediaDimensions: '1280 × 720', dataSource: 'NASA / DLR GRACE',
  },
  {
    id: 'co2', title: 'Atmospheric CO₂ Trends', category: 'atmosphere', period: 'Keeling curve 1980–September 2014; complete animation includes 1958–2022',
    description: {
      pt: 'Animação com a curva de Keeling e outras séries atmosféricas. Mauna Loa, Polo Sul e tendência global aparecem em traços separados; um painel adicional mostra medições troposféricas AIRS/AMSU entre setembro de 2002 e setembro de 2014. A página explica que são fontes e períodos diferentes.',
      en: 'Animation of the Keeling curve and other atmospheric records. Mauna Loa, South Pole and the global trend are shown as separate traces; an additional panel shows AIRS/AMSU tropospheric measurements from September 2002 to September 2014. The page explains that these are different sources and periods.',
    },
    variables: {
      pt: 'Concentração de CO₂ em partes por milhão (ppm); observações terrestres e de satélite em séries separadas. A página estima cerca de 36 bilhões de toneladas de CO₂ adicionadas à atmosfera por ano.',
      en: 'CO₂ concentration in parts per million (ppm); ground and satellite observations are separate records. The page estimates about 36 billion tons of CO₂ added to the atmosphere each year.',
    },
    caution: {
      pt: 'Os traços não são uma única série homogênea: altitude, instrumento, fonte e intervalo variam. O vídeo não demonstra valores simultâneos de um instrumento único.',
      en: 'The traces are not one homogeneous series: altitude, instrument, source and period vary. The video does not show simultaneous values from one instrument.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/30556/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030500/a030556/pumphandle_hyper_2022_1080p.webm',
    mediaType: 'video/webm', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030500/a030556/pumphandle_hyper_2022_1080p.00001_print.jpg',
    audioStatus: 'present', mediaDimensions: '1920 × 1080', dataSource: 'Mauna Loa, South Pole, AIRS/AMSU and additional records',
  },
  {
    id: 'biosphere', title: '20 Years of Global Biosphere (updated)', category: 'biosphere', period: 'September 1997–September 2017',
    description: {
      pt: 'Visualização Mollweide da biosfera global ao longo de 20 anos, baseada em observações de vários satélites. Luz refletida é usada para visualizar padrões de crescimento fotossintético, com variáveis diferentes no oceano e em terra.',
      en: 'Mollweide visualization of Earth’s biosphere over 20 years, based on observations from multiple satellites. Reflected light is used to visualize photosynthetic growth patterns, with different variables over ocean and land.',
    },
    variables: {
      pt: 'Oceano: clorofila (mg/m³). Terra: índice NDVI, sem unidade física indicada na página. Não é contagem direta de biomassa.',
      en: 'Ocean: chlorophyll (mg/m³). Land: NDVI, with no physical unit specified on the page. This is not a direct biomass count.',
    },
    caution: {
      pt: 'As cores do oceano e da terra representam variáveis distintas e não compartilham uma escala única. A NASA indica que há versão mais recente.',
      en: 'Ocean and land colors represent different variables and do not share one common scale. NASA notes that a newer version exists.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/4596/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004500/a004596/biosphere7_mollweide_1080p30.webm',
    mediaType: 'video/webm', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004500/a004596/biosphere7_mollweide.4507_print.jpg',
    audioStatus: 'absent', mediaDimensions: '1920 × 1080', dataSource: 'SeaWiFS, Aqua/MODIS and Suomi NPP/VIIRS',
  },
  {
    id: 'amazon', title: 'Amazon Deforestation', category: 'land', period: '2000–2010 · Rondônia, Brazil',
    description: {
      pt: 'Sequência de imagens MODIS/Terra da região de Rondônia, no Brasil, entre 2000 e 2010. A descrição NASA identifica floresta intacta em verde-escuro e áreas abertas em bege ou verde-claro, mostrando um padrão de expansão de estradas e clareiras.',
      en: 'Sequence of MODIS/Terra images of Rondônia, Brazil, from 2000 to 2010. NASA describes intact forest as dark green and cleared areas as tan or light green, showing a pattern of expanding roads and clearings.',
    },
    variables: {
      pt: 'Imagens de satélite MODIS/Terra; cores categóricas descritas pela página. Nenhuma unidade ou escala quantitativa é publicada para as cores.',
      en: 'MODIS/Terra satellite imagery; categorical colors described on the page. No quantitative scale or units are published for the colors.',
    },
    caution: {
      pt: 'A sequência mostra Rondônia, não uma quantificação de toda a Amazônia. Não interprete as cores como medições de área sem escala quantitativa.',
      en: 'The sequence shows Rondônia, not a measurement of the entire Amazon. Do not interpret the colors as area measurements without a quantitative scale.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/30166/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030100/a030166/woc_AmazonDeforestation.webmhd.webm',
    mediaType: 'video/webm', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a030000/a030100/a030166/woc_AmazonDeforestation.0.png',
    audioStatus: 'absent', mediaDimensions: '960 × 540', dataSource: 'NASA Terra MODIS',
  },
  {
    id: 'agriculture', title: 'Impact of Climate Change on Global Agricultural Yields', category: 'agriculture', period: 'Projections through the end of the 21st century (up to 2100)',
    description: {
      pt: 'Mapas de projeções de rendimento de trigo e milho construídas com conjuntos de modelos agrícolas e climáticos. A página descreve possíveis mudanças médias globais, condicionadas à continuidade das tendências climáticas, e diferenças regionais.',
      en: 'Maps of wheat and maize yield projections built from ensembles of crop and climate models. The page describes possible global-average changes, conditional on continued climate trends, and regional differences.',
    },
    variables: {
      pt: 'Mudança percentual de rendimento; legenda de −40% a +40%. A página cita cenários de −24% para milho e +17% para trigo até o fim do século, não rendimento absoluto.',
      en: 'Percentage yield change; legend from −40% to +40%. The page cites scenarios of −24% for maize and +17% for wheat by century’s end, not absolute yield.',
    },
    caution: {
      pt: 'São projeções condicionais de modelos, não resultados observados nem previsões garantidas. A página não especifica explicitamente o ano inicial da animação.',
      en: 'These are conditional model projections, not observed results or guaranteed forecasts. The page does not explicitly specify the animation’s starting year.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/4974/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004974/AgMapMaize.webm',
    mediaType: 'video/webm', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004974/AgMapMaize.00900_print.jpg',
    audioStatus: 'present', mediaDimensions: '3840 × 2160', dataSource: 'Ensembles de modelos de cultivos e clima',
  },
  {
    id: 'temperature', title: 'Global Temperature Anomalies from 1880 to 2021', category: 'climate', period: '1880–2021 · rolling five-year averages',
    description: {
      pt: 'Mapa Robinson de anomalias da temperatura da superfície global ao longo do tempo. O quadro final é uma média móvel de cinco anos, 2017–2021, não uma leitura isolada de 2021. Tons azuis indicam valores abaixo do normal; vermelho, acima; branco, próximo da referência.',
      en: 'Robinson map of global surface temperature anomalies over time. The final frame is a five-year average, 2017–2021, not a single-year reading for 2021. Blue shades indicate below-normal values, red above normal, and white near the reference.',
    },
    variables: {
      pt: 'Anomalia em °F; referência NASA 1951–1980; períodos móveis de cinco anos.',
      en: 'Anomaly in °F; NASA 1951–1980 reference; rolling five-year periods.',
    },
    caution: {
      pt: 'Anomalias não são temperaturas absolutas. Cada quadro agrega cinco anos; não o confunda com dado anual nem infira causas pelo mapa.',
      en: 'Anomalies are not absolute temperatures. Each frame aggregates five years; do not treat it as a single-year value or infer causes from the map.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/4964/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004964/2021GISStempF-5yrAvg.webm',
    mediaType: 'video/webm', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004964/2021f-TemperatureAnomalyF.0900_print.jpg',
    audioStatus: 'present', mediaDimensions: '1920 × 1080', dataSource: 'NASA GISTEMP',
  },
  {
    id: 'climate-spiral', title: 'NASA Climate Spiral 1880–Present', category: 'climate', period: '1880–present · monthly global series',
    description: {
      pt: 'Espiral climática da NASA baseada na série de temperatura global GISTEMP v4. A página informa atualização mensal aproximadamente duas semanas após o fim de cada mês; a visualização escolhida é identificada como anomalias mensais em Celsius.',
      en: 'NASA climate spiral based on the GISTEMP v4 global temperature record. The page says it is updated monthly, about two weeks after the end of each month; the selected visualization is identified as monthly anomalies in Celsius.',
    },
    variables: {
      pt: 'Anomalias mensais globais em °C, relativas à média de referência 1951–1980; versões °F também existem na página NASA.',
      en: 'Monthly global anomalies in °C relative to the 1951–1980 reference mean; °F versions are also available on the NASA page.',
    },
    caution: {
      pt: 'Série global agregada: não mostra distribuição geográfica nem atribui causas. “Presente” é o título da página atualizável, não um último ano fixo.',
      en: 'Aggregated global series: it does not show geographic distribution or attribute causes. “Present” reflects an updatable page title, not a fixed final year.',
    },
    pageUrl: 'https://svs.gsfc.nasa.gov/5190/',
    mediaUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005190/GISTEMP_Spiral_English_degC_2160p60.mp4',
    mediaType: 'video/mp4', posterUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005190/GISTEMP_Spiral_English_degC_2160p60.01402_full.jpg',
    audioStatus: 'absent', mediaDimensions: '2160 × 2160', dataSource: 'NASA GISS GISTEMP v4',
  },
];

export const resourceTitle = (resource: NASAResource, _locale: Locale) => resource.title;
