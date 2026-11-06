import { ArrowDownRight, ArrowRight, AudioLines, CircleDot, Film, Globe2, Headphones, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { copy } from '../data/i18n';

export function HomePage() {
  const { locale } = useApp();
  const ui = copy[locale];
  return <div className="home-page">
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-mark" />{ui.home.eyebrow}<span className="hero-year">NASA · 2021</span></p>
        <h1>{ui.home.title}</h1>
        <p className="hero-subtitle">{ui.home.subtitle}</p>
        <div className="hero-actions"><Link className="button button-primary button-large" to="/catalogo">{ui.home.start}<ArrowRight size={17} aria-hidden="true" /></Link><a className="button button-text" href="#how-it-works">{ui.home.how}<ArrowDownRight size={15} aria-hidden="true" /></a></div>
        <div className="hero-data-line"><span className="signal-dot" />{ui.home.sourceLine}</div>
      </div>
      <div className="hero-visual" aria-label={locale === 'pt' ? 'Imagem da Terra vista do espaço, acompanhada de uma forma de onda científica' : 'Earth from space with a scientific waveform'} role="img">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
        <div className="earth-frame"><img src="/images/earth/blue-marble.jpg" alt={locale === 'pt' ? 'A Terra vista do espaço sobre as Américas; imagem NASA Blue Marble.' : 'Earth from space over the Americas; NASA Blue Marble image.'} /><span className="earth-shadow" /></div>
        <div className="hero-coordinate"><span>{locale === 'pt' ? 'OBSERVATÓRIO TERRESTRE' : 'EARTH OBSERVATORY'}</span><strong>00° 00′ N</strong><small>{locale === 'pt' ? 'SINAL PLANETÁRIO' : 'PLANETARY SIGNAL'}</small></div>
        <div className="hero-wave"><div className="hero-wave-head"><span><AudioLines size={14} /> SIGNAL / 2021</span><span>{locale === 'pt' ? 'PRÉVIA ABSTRATA' : 'ABSTRACT PREVIEW'}</span></div><svg viewBox="0 0 360 42" role="img" aria-label={locale === 'pt' ? 'Forma de onda abstrata, sem valor científico representado' : 'Abstract waveform, no scientific value represented'}><path d="M0 22 C14 22 12 7 24 7 S38 37 50 37 64 11 78 11 89 28 100 28 114 4 127 4 140 32 153 32 167 15 179 15 195 28 206 28 219 8 232 8 245 35 258 35 270 13 282 13 295 26 307 26 321 6 334 6 346 29 360 29" fill="none" stroke="currentColor" strokeWidth="2" /></svg><div className="hero-wave-foot"><span>{locale === 'pt' ? 'FREQUÊNCIA' : 'FREQUENCY'}</span><span>{locale === 'pt' ? 'VARIAÇÃO MENSAL' : 'MONTHLY CHANGE'}</span><span>{locale === 'pt' ? 'AMPLITUDE' : 'AMPLITUDE'}</span></div></div>
        <span className="orbit-label orbit-label-a"><span /> 1951–1980</span><span className="orbit-label orbit-label-b"><span /> DU / °F</span>
      </div>
      <div className="hero-bottom-mark"><span>01</span><span>CAMADAS DE LEITURA</span><span className="hero-bottom-line" /><span>01 / 03</span></div>
    </section>

    <section className="section-block section-featured">
      <div className="section-kicker"><span>01</span><span>{locale === 'pt' ? 'EXPLORAÇÃO CIENTÍFICA' : 'SCIENTIFIC EXPLORATION'}</span></div>
      <div className="featured-heading"><div><h2>{ui.home.featured}</h2><p>{ui.home.featuredText}</p></div><Link className="text-link" to="/catalogo">{locale === 'pt' ? 'Ver catálogo' : 'View catalog'}<ArrowRight size={16} /></Link></div>
      <div className="experience-list">
        <Link to="/explorar/temperatura" className="experience-row experience-temperature"><span className="experience-index">01</span><span className="experience-icon"><Globe2 size={22} /></span><span className="experience-content"><small>GISTEMP V4 / 2021</small><strong>{ui.home.temperature}</strong><span>{ui.home.temperatureText}</span></span><span className="experience-spark"><svg viewBox="0 0 122 34" aria-hidden="true"><path d="M1 20h12l7-10 8 20 8-15 8 8 10-18 10 24 9-13 9 7 8-11 8 11 9-8 9 7 9-17" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span><ArrowRight className="experience-arrow" size={20} /></Link>
        <Link to="/explorar/ozonio" className="experience-row experience-ozone"><span className="experience-index">02</span><span className="experience-icon"><CircleDot size={22} /></span><span className="experience-content"><small>OZONE WATCH / 1983—2018</small><strong>{ui.home.ozone}</strong><span>{ui.home.ozoneText}</span></span><span className="experience-spark ozone-spark"><svg viewBox="0 0 122 34" aria-hidden="true"><path d="M1 7h16l8 4 8 8 8-2 8 5 8 2 8-8 8-8 8 2 8 12 8 7 8-9 10-2 8 7 9-2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span><ArrowRight className="experience-arrow" size={20} /></Link>
        <Link to="/materiais" className="experience-row experience-media"><span className="experience-index">03</span><span className="experience-icon"><Film size={22} /></span><span className="experience-content"><small>NASA SVS / 9 FILMS</small><strong>{locale === 'pt' ? 'Biblioteca audiovisual NASA' : 'NASA media library'}</strong><span>{locale === 'pt' ? 'Assista às animações oficiais, leia os contextos e ouça a narração acessível.' : 'Watch official visualizations, read their context and hear accessible narration.'}</span></span><span className="experience-spark media-spark"><AudioLines size={22} /></span><ArrowRight className="experience-arrow" size={20} /></Link>
      </div>
    </section>

    <section className="section-block how-section" id="how-it-works">
      <div className="section-kicker"><span>02</span><span>{locale === 'pt' ? 'MÉTODO' : 'METHOD'}</span></div>
      <div className="how-layout"><div><p className="eyebrow"><Waves size={14} /> EARTHSOUND / PROCESS</p><h2>{ui.home.howTitle}</h2><p className="how-note">{ui.home.scientificNote}</p></div><div className="method-steps"><div className="method-step"><span>01</span><p>{ui.home.step1}</p><Headphones size={18} /></div><div className="method-step"><span>02</span><p>{ui.home.step2}</p><Globe2 size={18} /></div><div className="method-step"><span>03</span><p>{ui.home.step3}</p><AudioLines size={18} /></div></div></div>
    </section>
  </div>;
}
