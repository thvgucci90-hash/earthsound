import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, Headphones, Info, Volume2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { copy } from '../data/i18n';
import { useApp } from '../context/AppContext';
import { DataState, PageIntro, SourceLink } from '../components/Common';
import { GuidedTour } from '../components/GuidedTour';

const years = [1983, 1988, 1993, 1998, 2003, 2008, 2013, 2018] as const;
type OzoneYear = typeof years[number];

function getOzoneAlt(year: number, locale: 'pt' | 'en', sourceLabel: string) {
  return locale === 'pt'
    ? `Mapa ${year} da série NASA ${sourceLabel}. Visualização anual da coluna total de ozônio sobre a Antártida, em unidades Dobson (DU). Consulte a legenda original da imagem; o EarthSound não estima valores a partir dos pixels.`
    : `${year} map from the NASA ${sourceLabel} series. Annual visualization of total ozone column over Antarctica, in Dobson units (DU). See the image's original legend; EarthSound does not estimate values from pixels.`;
}

export function OzonePage() {
  const { locale, speak, announce } = useApp();
  const ui = copy[locale];
  const text = ui.ozone;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryYear = Number(searchParams.get('year'));
  const initialYear = years.includes(queryYear as OzoneYear) ? queryYear as OzoneYear : 2018;
  const [year, setYear] = useState<OzoneYear>(initialYear);
  const [compare, setCompare] = useState(false);
  const [compareYear, setCompareYear] = useState<OzoneYear>(1983);
  const [imageError, setImageError] = useState(false);
  const index = years.indexOf(year);
  const yearCaption = useMemo(() => getOzoneAlt(year, locale, text.source), [year, locale, text.source]);

  useEffect(() => {
    const query = Number(searchParams.get('year'));
    if (years.includes(query as OzoneYear)) setYear(query as OzoneYear);
    if (searchParams.has('year')) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);
  useEffect(() => { setImageError(false); }, [year, compareYear]);
  useEffect(() => {
    if (compare && year === compareYear) setCompareYear(year === 2018 ? 1983 : 2018);
  }, [compare, year, compareYear]);
  useEffect(() => {
    const handle = (event: WindowEventMap['earthsound:page-action']) => {
      if (event.detail.action === 'readDescription') speak(`${year}. ${text.description} ${text.explanation}`);
      if (event.detail.action === 'selectYear' && typeof event.detail.value === 'number' && years.includes(event.detail.value as OzoneYear)) setYear(event.detail.value as OzoneYear);
    };
    window.addEventListener('earthsound:page-action', handle);
    return () => window.removeEventListener('earthsound:page-action', handle);
  }, [speak, text.description, text.explanation, year]);

  function setSelected(nextIndex: number) {
    const safe = Math.max(0, Math.min(years.length - 1, nextIndex));
    const nextYear = years[safe];
    if (nextYear === undefined) return;
    setYear(nextYear);
    announce(`${text.selected}: ${nextYear}`);
  }
  function readMap() { speak(`${yearCaption} ${text.explanation} ${text.threshold}`); }

  return <div className="page-wrap ozone-page">
    <PageIntro eyebrow={text.eyebrow} title={text.title} subtitle={text.subtitle}>
      <div className="page-intro-tools"><DataState kind="verified">{locale === 'pt' ? 'Imagens históricas NASA' : 'Historical NASA images'}</DataState><GuidedTour type="ozone" /></div>
    </PageIntro>

    <section className="ozone-hero-panel" aria-labelledby="ozone-map-title">
      <div className="ozone-panel-top"><div><p className="eyebrow">{text.record}</p><h2 id="ozone-map-title">{year} <span>ANTARCTIC OZONE</span></h2></div><button type="button" className="speak-map-button" onClick={readMap}><Headphones size={16} />{locale === 'pt' ? 'Ouvir descrição' : 'Hear description'}</button></div>
      <div className={compare ? 'ozone-map-layout comparing' : 'ozone-map-layout'}>
        <figure className="ozone-map-figure selected-map"><div className="ozone-image-wrap"><img src={`/images/ozone/${year}.jpg`} alt={getOzoneAlt(year, locale, text.source)} onError={() => setImageError(true)} /><span className="map-year-badge">{year}</span>{imageError && <div className="image-error" role="alert">{locale === 'pt' ? 'A imagem histórica não carregou.' : 'Historical image could not be loaded.'}</div>}</div><figcaption><span>{text.selected}</span><strong>{year}</strong></figcaption></figure>
        {compare && <figure className="ozone-map-figure compare-map"><div className="ozone-image-wrap"><img src={`/images/ozone/${compareYear}.jpg`} alt={getOzoneAlt(compareYear, locale, text.source)} /><span className="map-year-badge">{compareYear}</span></div><figcaption><span>{text.compareWith}</span><label className="sr-only" htmlFor="compare-year">{text.compareWith}</label><select id="compare-year" value={compareYear} onChange={(event) => setCompareYear(Number(event.target.value) as OzoneYear)}>{years.filter((candidate) => candidate !== year).map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}</select></figcaption></figure>}
      </div>
      <div className="ozone-map-caption"><span className="dobson-dot" />{text.legend}<span className="threshold-pill">220 DU</span></div>
      <p className="ozone-visual-note"><Info size={15} />{text.compareExplanation}</p>
      <div className="ozone-timeline">
        <div className="timeline-heading"><span className="eyebrow">{text.timeline}</span><span>{String(index + 1).padStart(2, '0')} / 08</span></div>
        <label htmlFor="ozone-year-range" className="sr-only">{text.timeline}</label>
        <input id="ozone-year-range" className="year-range" type="range" min="0" max="7" step="1" value={index} onChange={(event) => setSelected(Number(event.target.value))} aria-valuetext={String(year)} />
        <div className="year-list" role="group" aria-label={text.timeline}>{years.map((item, itemIndex) => <button type="button" key={item} className={item === year ? 'year-button current' : 'year-button'} aria-pressed={item === year} onClick={() => setSelected(itemIndex)}>{item}</button>)}</div>
        <div className="timeline-controls"><button type="button" className="button button-quiet" disabled={index === 0} onClick={() => setSelected(index - 1)}><ArrowLeft size={15} />{text.prev}</button><label className="compare-control"><input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} /><span className="toggle-mark" /><span>{text.comparison}</span></label><button type="button" className="button button-quiet" disabled={index === years.length - 1} onClick={() => setSelected(index + 1)}>{text.next}<ArrowRight size={15} /></button></div>
      </div>
    </section>

    <section className="ozone-explanation-grid"><article className="ozone-fact-card"><div className="fact-number">220<span> DU</span></div><div><p className="eyebrow">{locale === 'pt' ? 'LIMIAR DE DEFINIÇÃO' : 'DEFINITION THRESHOLD'}</p><h2>{text.threshold}</h2><p>{text.explanation}</p></div></article><aside className="no-ozone-sonification"><span className="sonic-disabled-icon"><AudioLines size={20} /></span><div><p className="eyebrow">{locale === 'pt' ? 'SONIFICAÇÃO' : 'SONIFICATION'}</p><h2>{text.noSonic}</h2><p>{text.noSonicText}</p><button type="button" className="button button-small" onClick={readMap}><Volume2 size={15} />{locale === 'pt' ? 'Ler em voz alta' : 'Read aloud'}</button></div></aside></section>

    <section className="ozone-source-card"><div><span className="eyebrow">{ui.common.sources}</span><h2>{text.source}</h2><p>{text.separate} {locale === 'pt' ? 'Os instrumentos usados na série variam ao longo do período; consulte a publicação NASA para o contexto e créditos de cada imagem.' : 'Instruments used across the series vary over time; see NASA’s publication for context and image credits.'}</p></div><SourceLink href="https://science.nasa.gov/earth/earth-observatory/world-of-change/ozone-hole/">NASA Earth Observatory · World of Change</SourceLink></section>
    <div className="page-bottom-nav"><Link to="/explorar/temperatura">← {ui.nav.temperature}</Link><Link to="/catalogo">{ui.nav.catalog} →</Link></div>
  </div>;
}
