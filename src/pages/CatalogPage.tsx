import { useMemo, useState } from 'react';
import { ArrowUpRight, AudioLines, CircleDot, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { copy } from '../data/i18n';
import { useApp } from '../context/AppContext';
import { PageIntro } from '../components/Common';

type Filter = 'all' | 'temperature' | 'ozone';

export function CatalogPage() {
  const { locale } = useApp();
  const ui = copy[locale];
  const [filter, setFilter] = useState<Filter>('all');
  const catalog = useMemo(() => [
    { id: 'temperature' as const, href: '/explorar/temperatura', icon: <Globe2 size={22} />, eyebrow: 'GISTEMP V4 / 2021', title: ui.home.temperature, description: ui.home.temperatureText, source: ui.catalog.source, meta: '2° × 2° · 12 MONTHS', tone: 'temperature' },
    { id: 'ozone' as const, href: '/explorar/ozonio', icon: <CircleDot size={22} />, eyebrow: 'ANTARCTIC OZONE / 1983—2018', title: ui.home.ozone, description: ui.home.ozoneText, source: ui.catalog.sourceOzone, meta: '8 HISTORICAL MAPS', tone: 'ozone' },
  ], [ui]);
  const shown = filter === 'all' ? catalog : catalog.filter((item) => item.id === filter);
  const filters: { id: Filter; label: string }[] = [{ id: 'all', label: ui.catalog.filterAll }, { id: 'temperature', label: ui.catalog.filterTemperature }, { id: 'ozone', label: ui.catalog.filterOzone }];

  return <div className="page-wrap catalog-page">
    <PageIntro eyebrow={ui.catalog.eyebrow} title={ui.catalog.title} subtitle={ui.catalog.subtitle}><div className="catalog-status"><span className="signal-dot" />{locale === 'pt' ? '02 EXPERIÊNCIAS DISPONÍVEIS' : '02 EXPERIENCES AVAILABLE'}</div></PageIntro>
    <div className="catalog-filter" role="group" aria-label={locale === 'pt' ? 'Filtrar catálogo' : 'Filter catalog'}>{filters.map((item) => <button key={item.id} type="button" className={filter === item.id ? 'filter-chip selected' : 'filter-chip'} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
    <div className="catalog-grid">{shown.map((item, index) => <article key={item.id} className={`catalog-card catalog-card-${item.tone}`}><div className="catalog-card-top"><span className="catalog-number">0{index + 1}</span><span className="catalog-icon">{item.icon}</span><span className="catalog-live"><span />{item.id === 'temperature' ? ui.catalog.statusLive : ui.catalog.statusImage}</span></div><p className="eyebrow">{item.eyebrow}</p><h2>{item.title}</h2><p className="catalog-description">{item.description}</p><div className="catalog-card-meta"><span>{item.source}</span><span>{item.meta}</span></div><Link to={item.href} className="catalog-open">{ui.catalog.open}<ArrowUpRight size={17} /></Link></article>)}</div>
    <aside className="catalog-footnote"><AudioLines size={18} /><p>{ui.catalog.note}</p></aside>
  </div>;
}
