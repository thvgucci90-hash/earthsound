import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowUp, Info, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { copy } from '../data/i18n';
import { useApp } from '../context/AppContext';
import { PageIntro, SourceLink, DataState } from '../components/Common';
import { AudioPanel } from '../components/AudioPanel';
import { GuidedTour } from '../components/GuidedTour';
import { TemperatureMap } from '../components/TemperatureMap';
import { useSonification } from '../hooks/useSonification';
import { celsiusAnomalyToFahrenheit, regionAnnualMeanC, regionSeriesC, type RegionId, type TemperatureDataset } from '../lib/temperature';

const regionIds: RegionId[] = ['global', 'northAmerica', 'southAmerica', 'europe', 'africa', 'asia', 'oceania', 'antarctica', 'arctic'];

function monthPath(values: (number | null)[], width: number, height: number) {
  const valid = values.map((value, index) => ({ value, index })).filter((point): point is { value: number; index: number } => point.value !== null && Number.isFinite(point.value));
  if (valid.length < 2) return '';
  const y = (value: number) => height - ((Math.max(-2.2, Math.min(2.2, value)) + 2.2) / 4.4) * height;
  return valid.map((point, index) => `${index ? 'L' : 'M'} ${(point.index / 11) * width} ${y(point.value)}`).join(' ');
}

function describeSeries(values: (number | null)[]) {
  const valid = values.map((value, index) => ({ value, index })).filter((point): point is { value: number; index: number } => point.value !== null && Number.isFinite(point.value));
  if (!valid.length) return null;
  return {
    low: valid.reduce((best, point) => point.value < best.value ? point : best),
    high: valid.reduce((best, point) => point.value > best.value ? point : best),
    first: valid[0]!,
    last: valid[valid.length - 1]!,
  };
}

function MonthlyChart({ values, globalValues, monthIndex, onSelect, monthNames, compare }: {
  values: (number | null)[]; globalValues: (number | null)[]; monthIndex: number;
  onSelect: (index: number) => void; monthNames: readonly string[]; compare: boolean;
}) {
  const { locale } = useApp();
  const width = 660;
  const height = 185;
  const pointY = (value: number | null) => height - ((Math.max(-2.2, Math.min(2.2, value ?? 0)) + 2.2) / 4.4) * height;
  const keyDown = (event: KeyboardEvent<SVGCircleElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(index); }
  };
  return <figure className="month-chart" aria-labelledby="chart-caption" aria-describedby="chart-access-description">
    <svg viewBox={`-14 -10 ${width + 28} ${height + 42}`} role="group" aria-label={locale === 'pt' ? 'Gráfico mensal de anomalia; selecione um ponto para mudar o mês' : 'Monthly anomaly chart; select a point to change month'} aria-describedby="chart-access-description">
      {[0, 1, 2, 3, 4].map((line) => { const y = (height / 4) * line; return <g key={line}><line className="chart-grid" x1="0" x2={width} y1={y} y2={y} /><text className="chart-axis-label" x="-7" y={y + 4} textAnchor="end">{(2.2 - line * 1.1).toFixed(1)}</text></g>; })}
      {compare && <path d={monthPath(globalValues, width, height)} className="chart-line chart-line-global" />}
      {compare && <path d={monthPath(values, width, height)} className="chart-line chart-line-region" />}
      {!compare && <path d={monthPath(values, width, height)} className="chart-line chart-line-region" />}
      {values.map((value, index) => value === null ? null : <circle key={index} className={`chart-point ${index === monthIndex ? 'selected' : ''}`} cx={(index / 11) * width} cy={pointY(value)} r={index === monthIndex ? 6 : 4} role="button" tabIndex={0} aria-label={`${monthNames[index]}: ${value.toFixed(2)} °C (${(value * 1.8).toFixed(2)} °F)`} aria-pressed={index === monthIndex} onClick={() => onSelect(index)} onKeyDown={(event) => keyDown(event, index)} />)}
      {monthNames.map((name, index) => <text key={name} className={`chart-month-label ${index === monthIndex ? 'active' : ''}`} x={(index / 11) * width} y={height + 21} textAnchor="middle">{locale === 'pt' ? name.slice(0, 3) : name.slice(0, 3)}</text>)}
    </svg>
    <figcaption id="chart-caption" className="chart-caption"><span>{locale === 'pt' ? 'Anomalia de temperatura (°C)' : 'Temperature anomaly (°C)'}</span><span>{compare ? <>{locale === 'pt' ? 'Média global NASA' : 'NASA global mean'} <i className="chart-key-global" />{locale === 'pt' ? 'Região selecionada' : 'Selected region'} <i className="chart-key-region" /></> : <>{locale === 'pt' ? 'Série selecionada' : 'Selected series'} <i className="chart-key-region" /></>}</span></figcaption>
  </figure>;
}

export function TemperaturePage() {
  const { locale, speak, announce } = useApp();
  const ui = copy[locale];
  const text = ui.temperature;
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataset, setDataset] = useState<TemperatureDataset | null>(null);
  const [error, setError] = useState(false);
  const [monthIndex, setMonthIndex] = useState(0);
  const [region, setRegion] = useState<RegionId>('global');
  const [compare, setCompare] = useState(false);
  const didAutoPlay = useRef(false);
  const audio = useSonification((index) => { if (index >= 0) setMonthIndex(index); });

  const loadData = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch('/data/gistemp-2021.json');
      if (!response.ok) throw new Error('Data request failed');
      const value = await response.json() as TemperatureDataset;
      if (value.schema !== 'earthsound-gistemp-2021-v1' || value.months.length !== 12) throw new Error('Data schema mismatch');
      setDataset(value);
    } catch { setError(true); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);
  const regionSeries = useMemo(() => dataset ? regionSeriesC(dataset, region) : [], [dataset, region]);
  const globalSeries = useMemo(() => dataset ? regionSeriesC(dataset, 'global') : [], [dataset]);
  useEffect(() => { audio.setSeries(regionSeries); }, [audio.setSeries, regionSeries]);
  const currentC = regionSeries[monthIndex] ?? null;
  const currentF = celsiusAnomalyToFahrenheit(currentC);
  const selectedMonth = text.monthNames[monthIndex] || text.monthNames[0];
  const regionLabel = text.regions[region];
  const regionStats = useMemo(() => describeSeries(regionSeries), [regionSeries]);
  const globalStats = useMemo(() => describeSeries(globalSeries), [globalSeries]);
  const chartDescription = useMemo(() => {
    if (!regionStats) return locale === 'pt'
      ? 'O gráfico apresenta a anomalia mensal de temperatura da superfície de janeiro a dezembro de 2021. O eixo vertical usa graus Celsius de anomalia em relação à média de 1951–1980.'
      : 'The chart shows monthly surface temperature anomalies from January through December 2021. The vertical axis uses degrees Celsius anomaly relative to the 1951–1980 mean.';
    const scope = region === 'global'
      ? (locale === 'pt' ? 'média global mensal NASA' : 'NASA monthly global mean')
      : (locale === 'pt' ? `média descritiva de ${regionLabel}, calculada pelo EarthSound a partir da grade NASA` : `EarthSound descriptive mean for ${regionLabel}, calculated from the NASA grid`);
    const format = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)} °C`;
    if (locale === 'pt') {
      const comparison = compare && region !== 'global' && globalStats
        ? ` A comparação mostra a linha tracejada ciano da ${text.globalValue} e a linha contínua amarela de ${regionLabel}; na série global, o menor ponto ocorre em ${text.monthNames[globalStats.low.index]} (${format(globalStats.low.value)}) e o maior em ${text.monthNames[globalStats.high.index]} (${format(globalStats.high.value)}).`
        : '';
      return `Gráfico de linha dos 12 meses de 2021. O eixo horizontal mostra o mês, de janeiro a dezembro. O eixo vertical mostra a anomalia da superfície em °C, em relação à média de 1951–1980, na faixa visível de −2,2 a +2,2 °C. A série selecionada é a ${scope}; seu menor valor é ${format(regionStats.low.value)} em ${text.monthNames[regionStats.low.index]} e o maior é ${format(regionStats.high.value)} em ${text.monthNames[regionStats.high.index]}. Entre janeiro (${format(regionStats.first.value)}) e dezembro (${format(regionStats.last.value)}), a diferença é ${format(regionStats.last.value - regionStats.first.value)}.${comparison} Os pontos podem ser ativados para selecionar o mês e atualizar o mapa e a sonificação.`;
    }
    const comparison = compare && region !== 'global' && globalStats
      ? ` The chart also shows the dashed cyan ${text.globalValue} and solid yellow ${regionLabel} series; the global series is lowest in ${text.monthNames[globalStats.low.index]} (${format(globalStats.low.value)}) and highest in ${text.monthNames[globalStats.high.index]} (${format(globalStats.high.value)}).`
      : '';
    return `Line chart of the 12 months of 2021. The horizontal axis shows month, January to December. The vertical axis shows surface temperature anomaly in °C relative to the 1951–1980 mean, within the visible range −2.2 to +2.2 °C. The selected series is the ${scope}; its lowest value is ${format(regionStats.low.value)} in ${text.monthNames[regionStats.low.index]} and its highest is ${format(regionStats.high.value)} in ${text.monthNames[regionStats.high.index]}. The difference between January (${format(regionStats.first.value)}) and December (${format(regionStats.last.value)}) is ${format(regionStats.last.value - regionStats.first.value)}.${comparison} Activate a point to select its month and update the map and sonification.`;
  }, [regionStats, globalStats, region, regionLabel, compare, locale, text.globalValue, text.monthNames]);

  useEffect(() => {
    if (!dataset) return;
    const preset = searchParams.get('preset');
    if (preset === 'cold' || preset === 'warm') {
      const candidates = regionIds.filter((id): id is Exclude<RegionId, 'global'> => id !== 'global');
      const ranked = candidates.map((id) => ({ id, value: regionAnnualMeanC(dataset, id) })).filter((item): item is { id: Exclude<RegionId, 'global'>; value: number } => item.value !== null);
      ranked.sort((a, b) => a.value - b.value);
      const selected = ranked[preset === 'cold' ? 0 : ranked.length - 1]?.id;
      if (selected) setRegion(selected);
      setSearchParams({}, { replace: true });
    }
    if (searchParams.get('autoplay') === '1' && !didAutoPlay.current) {
      didAutoPlay.current = true;
      window.setTimeout(() => void audio.play(true), 450);
      setSearchParams({}, { replace: true });
    }
  }, [dataset, searchParams, setSearchParams, audio.play]);

  useEffect(() => {
    const handle = (event: WindowEventMap['earthsound:page-action']) => {
      if (event.detail.action === 'readDescription') speak(`${text.mapLabel}. ${text.description}`);
    };
    window.addEventListener('earthsound:page-action', handle);
    return () => window.removeEventListener('earthsound:page-action', handle);
  }, [speak, text.description, text.mapLabel]);

  function selectMonth(index: number) {
    const safe = Math.max(0, Math.min(11, index));
    setMonthIndex(safe);
    if (dataset) void audio.seek(safe);
    const selectedF = celsiusAnomalyToFahrenheit(regionSeries[safe] ?? null);
    announce(`${text.monthNames[safe]}: ${selectedF === null ? '—' : `${selectedF.toFixed(2)} °F`}`);
  }
  function selectRegion(next: RegionId) {
    if (next === 'global') setCompare(false);
    if (dataset) audio.setSeries(regionSeriesC(dataset, next));
    setRegion(next);
    const label = text.regions[next];
    announce(`${text.region}: ${label}`);
    if (dataset && audio.status !== 'playing') {
      const selected = regionSeriesC(dataset, next)[monthIndex];
      if (selected !== null && selected !== undefined) void audio.preview(monthIndex, 260);
    }
  }
  const coldest = useMemo(() => dataset ? regionIds.slice(1).map((id) => ({ id, value: regionAnnualMeanC(dataset, id) })).filter((item): item is { id: Exclude<RegionId, 'global'>; value: number } => item.value !== null).sort((a, b) => a.value - b.value)[0]?.id : undefined, [dataset]);
  const warmest = useMemo(() => dataset ? regionIds.slice(1).map((id) => ({ id, value: regionAnnualMeanC(dataset, id) })).filter((item): item is { id: Exclude<RegionId, 'global'>; value: number } => item.value !== null).sort((a, b) => b.value - a.value)[0]?.id : undefined, [dataset]);

  return <div className="page-wrap temperature-page">
    <PageIntro eyebrow={text.eyebrow} title={text.title} subtitle={text.subtitle}>
      <div className="page-intro-tools"><DataState>{text.dataset}</DataState><GuidedTour type="temperature" onStartAudio={() => void audio.play(true)} /></div>
    </PageIntro>
    <section className="temperature-workspace" aria-labelledby="map-panel-title">
      <div className="visual-panel">
        <div className="panel-heading"><div><span className="eyebrow">{locale === 'pt' ? 'ANOMALIA DA SUPERFÍCIE' : 'SURFACE ANOMALY'}</span><h2 id="map-panel-title">{selectedMonth} <span>2021</span></h2></div><span className="unit-tag">°F / ANOMALIA</span></div>
        {error && <div className="error-state" role="alert"><p>{text.dataError}</p><button type="button" className="button button-small" onClick={() => void loadData()}><RefreshCw size={14} />{ui.common.retry}</button></div>}
        {!dataset && !error && <div className="map-loading" role="status"><span className="loading-ring" />{ui.common.loading}</div>}
        {dataset && <>
          <TemperatureMap dataset={dataset} monthIndex={monthIndex} region={region} label={text.mapLabel} description={text.description} />
          <div className="map-legend" aria-label={locale === 'pt' ? 'Legenda de anomalias de temperatura' : 'Temperature anomaly legend'}><div className="legend-scale"><span>≤ −4 °F</span><span>0</span><span>≥ +4 °F</span></div><div className="legend-bar" /><div className="legend-captions"><span>{text.legend}</span><span>{text.neutral}</span><span>{text.warm}</span></div></div>
        </>}
        <p className="map-method"><Info size={14} />{text.baseline}. {text.method} {locale === 'pt' ? 'As cores saturam além de ±4 °F; as regiões são caixas geográficas simplificadas, não limites oficiais.' : 'Colors saturate beyond ±4 °F; regions are simplified bounding boxes, not official boundaries.'}</p>
      </div>
      <div className="selection-panel">
        <div className="selection-panel-head"><span className="eyebrow">{locale === 'pt' ? 'SINTONIA' : 'TUNING'}</span><span className="data-state-icon"><span className="signal-dot" /></span></div>
        <label htmlFor="month-range" className="field-label">{ui.common.month} <span>{selectedMonth}</span></label>
        <input id="month-range" className="month-range" type="range" min="0" max="11" step="1" value={monthIndex} onChange={(event) => selectMonth(Number(event.target.value))} aria-valuetext={selectedMonth} disabled={!dataset} />
        <div className="range-endpoints"><span>JAN</span><span>DEC</span></div>
        <label className="field-label" htmlFor="region-select">{text.region}</label>
        <select id="region-select" className="region-select" value={region} onChange={(event) => selectRegion(event.target.value as RegionId)} disabled={!dataset}>
          {regionIds.map((id) => <option key={id} value={id}>{text.regions[id]}</option>)}
        </select>
        <div className="region-shortcuts"><button type="button" onClick={() => coldest && selectRegion(coldest)} disabled={!dataset} aria-label={text.coldCommand}><ArrowDown size={14} />{locale === 'pt' ? 'Mais fria' : 'Coldest'}</button><button type="button" onClick={() => warmest && selectRegion(warmest)} disabled={!dataset} aria-label={text.warmCommand}><ArrowUp size={14} />{locale === 'pt' ? 'Mais quente' : 'Warmest'}</button></div>
        <div className="value-readout" aria-live="polite"><small>{text.selectedValue} / {regionLabel}</small><strong>{currentF === null ? '—' : `${currentF >= 0 ? '+' : ''}${currentF.toFixed(2)} °F`}</strong><span>{selectedMonth} · NASA GISTEMP v4</span></div>
        <button className="compare-toggle" type="button" aria-pressed={compare} aria-label={region === 'global' ? (locale === 'pt' ? 'Selecione uma região para comparar com a série global' : 'Select a region to compare with the global series') : text.compare} disabled={region === 'global'} onClick={() => setCompare((value) => !value)}><span className={`toggle-mark ${compare ? 'on' : ''}`} />{region === 'global' ? (locale === 'pt' ? 'Selecione uma região para comparar' : 'Select a region to compare') : compare ? text.compareOn : text.compareOff}</button>
        <button type="button" className="speak-description" onClick={() => speak(`${text.mapLabel}. ${text.description}`)}>{ui.common.read}</button>
      </div>
    </section>

    {dataset && <section className="chart-section" aria-labelledby="trend-heading"><div className="chart-header"><div><p className="eyebrow">{locale === 'pt' ? 'SÉRIE MENSAL' : 'MONTHLY SERIES'}</p><h2 id="trend-heading">{text.chartTitle}</h2></div><span className="chart-stat">2021 <span>12 / 12</span></span></div><MonthlyChart values={regionSeries} globalValues={globalSeries} monthIndex={monthIndex} onSelect={(index) => selectMonth(index)} monthNames={text.monthNames} compare={compare} /><p className="chart-access-description" id="chart-access-description">{chartDescription}</p></section>}

    <div className="temperature-lower-grid">
      <AudioPanel audio={audio} title={text.sonicTitle} explanation={text.sonicText} activeValue={currentC} activeLabel={`${selectedMonth} · ${regionLabel}`} />
      <aside className="source-card"><p className="eyebrow">{ui.common.sources}</p><h2>{text.dataset}</h2><p>{text.sourcesIntro}</p><div className="source-card-meta"><span>{text.baseline}</span><span>NASA / GISS</span><span>1200 km smoothing</span></div><SourceLink href="https://data.giss.nasa.gov/gistemp/">NASA GISTEMP v4</SourceLink><SourceLink href="https://data.giss.nasa.gov/gistemp/data_v4.html">{locale === 'pt' ? 'Grades e arquivos' : 'Grids and files'}</SourceLink><SourceLink href="https://svs.gsfc.nasa.gov/4975/">NASA SVS · 1880–2021</SourceLink><p className="source-caution"><Info size={13} />{text.method}</p></aside>
    </div>
    <div className="page-bottom-nav"><Link to="/catalogo">← {ui.nav.catalog}</Link><Link to="/explorar/ozonio">{ui.nav.ozone} →</Link></div>
  </div>;
}
