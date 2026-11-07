import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Shell } from './components/Shell';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { TemperaturePage } from './pages/TemperaturePage';
import { OzonePage } from './pages/OzonePage';
import { AccessibilityPage } from './pages/AccessibilityPage';

const MaterialsPage = lazy(() => import('./pages/MaterialsPage').then(({ MaterialsPage: page }) => ({ default: page })));

function VoiceRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, speak, readPage, volume, setVolume, announce, pauseSpeech, resumeSpeech, stopSpeech } = useApp();

  useEffect(() => {
    const handle = (event: WindowEventMap['earthsound:action']) => {
      const { action, value } = event.detail;
      const dispatch = (nextAction: string, nextValue?: string | number) => {
        window.dispatchEvent(new CustomEvent('earthsound:page-action', { detail: { action: nextAction, value: nextValue } }));
      };
      switch (action) {
        case 'home': navigate('/'); break;
        case 'catalog': navigate('/catalogo'); break;
        case 'materials': navigate('/materiais'); break;
        case 'temperature': navigate('/explorar/temperatura'); break;
        case 'ozone': navigate('/explorar/ozonio'); break;
        case 'selectYear': navigate(`/explorar/ozonio?year=${encodeURIComponent(String(value ?? 2018))}`); break;
        case 'cold': navigate('/explorar/temperatura?preset=cold'); break;
        case 'warm': navigate('/explorar/temperatura?preset=warm'); break;
        case 'play':
          if (location.pathname === '/explorar/temperatura' || location.pathname === '/materiais') dispatch('play');
          else navigate('/explorar/temperatura?autoplay=1');
          break;
        case 'volumeUp': setVolume(volume + 0.1); speak(locale === 'pt' ? `Volume em ${Math.round(Math.min(1, volume + 0.1) * 100)} por cento.` : `Volume at ${Math.round(Math.min(1, volume + 0.1) * 100)} percent.`); break;
        case 'volumeDown': setVolume(volume - 0.1); speak(locale === 'pt' ? `Volume em ${Math.round(Math.max(0, volume - 0.1) * 100)} por cento.` : `Volume at ${Math.round(Math.max(0, volume - 0.1) * 100)} percent.`); break;
        case 'pause': dispatch('pause'); if (location.pathname !== '/explorar/temperatura') pauseSpeech(); break;
        case 'resume': dispatch('resume'); if (location.pathname !== '/explorar/temperatura') resumeSpeech(); break;
        case 'stop': dispatch('stop'); if (location.pathname !== '/explorar/temperatura') stopSpeech(); break;
        case 'stopAll': dispatch('stop'); stopSpeech(); break;
        case 'pauseRead': pauseSpeech(); announce(locale === 'pt' ? 'Leitura pausada.' : 'Reading paused.'); break;
        case 'resumeRead': resumeSpeech(); announce(locale === 'pt' ? 'Leitura retomada.' : 'Reading resumed.'); break;
        case 'stopRead': stopSpeech(); announce(locale === 'pt' ? 'Leitura interrompida.' : 'Reading stopped.'); break;
        case 'readDescription':
          if (location.pathname === '/explorar/temperatura' || location.pathname === '/explorar/ozonio' || location.pathname === '/materiais') dispatch('readDescription');
          else readPage();
          break;
        case 'readPage': readPage(); break;
        case 'back': navigate(-1); break;
        case 'where': {
          const pt: Record<string, string> = {
            '/': 'Você está no início do EarthSound.', '/catalogo': 'Você está no catálogo de visualizações.',
            '/explorar/temperatura': 'Você está explorando a temperatura global de 2021.',
            '/explorar/ozonio': 'Você está explorando a camada de ozônio antártica.',
            '/acessibilidade': 'Você está na central de acessibilidade.', '/materiais': 'Você está na biblioteca de materiais NASA.',
          };
          const en: Record<string, string> = {
            '/': 'You are on the EarthSound home page.', '/catalogo': 'You are in the visualization catalog.',
            '/explorar/temperatura': 'You are exploring global temperature in 2021.',
            '/explorar/ozonio': 'You are exploring the Antarctic ozone layer.',
            '/acessibilidade': 'You are in the accessibility center.', '/materiais': 'You are in the NASA media library.',
          };
          speak((locale === 'pt' ? pt : en)[location.pathname] || (locale === 'pt' ? 'Página não encontrada.' : 'Page not found.'));
          break;
        }
        case 'help': {
          const help = locale === 'pt'
            ? 'Diga abrir início, abrir materiais NASA, começar exploração, abrir temperatura, explorar região fria ou quente, ouvir dados, pausar, retomar ou parar leitura, pausar, retomar ou parar áudio, abrir camada de ozônio, selecionar ano 2018, ler descrição, ler esta página, aumentar ou diminuir volume, onde estou, voltar ou ajuda.'
            : 'Say open home, open NASA materials, start exploration, open temperature, explore cold or warm region, play data, pause, resume or stop reading, pause, resume or stop audio, open ozone layer, select year 2018, read description, read this page, increase or decrease volume, where am I, go back, or help.';
          speak(help);
          break;
        }
        default: dispatch(action, value);
      }
    };
    window.addEventListener('earthsound:action', handle);
    return () => window.removeEventListener('earthsound:action', handle);
  }, [navigate, location.pathname, locale, speak, readPage, volume, setVolume, announce, pauseSpeech, resumeSpeech, stopSpeech]);

  return null;
}

function FocusRouteHeading() {
  const location = useLocation();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);
  return null;
}

function MaterialsLoading() {
  const { locale } = useApp();
  return <div className="page-wrap"><p role="status" aria-live="polite">{locale === 'pt' ? 'Carregando os materiais NASA…' : 'Loading NASA materials…'}</p></div>;
}

export function App() {
  return (
    <>
      <VoiceRouter />
      <FocusRouteHeading />
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/materiais" element={<Suspense fallback={<MaterialsLoading />}><MaterialsPage /></Suspense>} />
          <Route path="/explorar/temperatura" element={<TemperaturePage />} />
          <Route path="/explorar/ozonio" element={<OzonePage />} />
          <Route path="/acessibilidade" element={<AccessibilityPage />} />
          <Route path="/inicio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

function NotFound() {
  const { locale } = useApp();
  return <section className="page-wrap"><p className="eyebrow">404</p><h1>{locale === 'pt' ? 'Página não encontrada' : 'Page not found'}</h1><a className="button button-primary" href="/">{locale === 'pt' ? 'Voltar ao início' : 'Return home'}</a></section>;
}
