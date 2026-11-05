import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react';
import { copy } from '../data/i18n';
import { useApp } from '../context/AppContext';
import { primeAudioContext } from '../hooks/useSonification';

export function GuidedTour({ type, onStartAudio }: { type: 'temperature' | 'ozone'; onStartAudio?: () => void }) {
  const { locale, speak } = useApp();
  const ui = copy[locale].guided;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const titles = type === 'temperature' ? ui.steps : ui.stepsOzone;
  const descriptions = useMemo(() => locale === 'pt'
    ? type === 'temperature'
      ? ['Vamos explorar anomalias mensais de temperatura da superfície em 2021. O valor é uma diferença em relação à referência, não a temperatura absoluta.', 'Azul indica anomalia negativa, tons claros ficam perto de zero e vermelho indica anomalia positiva. A unidade exibida é Fahrenheit de anomalia.', 'O mapa mostra a grade NASA GISTEMP de 2° por 2°. A descrição textual acompanha a visualização.', 'Escolha um mês e uma região. A média regional é agregada a partir da grade e ponderada por latitude.', 'Agora o som acompanha a série mensal. O tom se eleva com a anomalia e a intensidade cresce levemente.', 'A sonificação é uma leitura complementar. Os controles permitem pausar, retomar, reiniciar, parar e ajustar o volume.', 'O roteiro termina aqui. Continue explorando por conta própria, volte a uma etapa ou repita a explicação.']
      : ['Vamos observar concentrações de ozônio sobre a Antártida. A camada de ozônio protege a vida ao absorver radiação ultravioleta.', 'Dobson Units (DU) medem o ozônio total na coluna da atmosfera. A NASA usa 220 DU para definir a área chamada de buraco.', 'Cada imagem é um mapa anual da NASA Earth Observatory para a data de maior profundidade do ano.', 'Selecione um dos oito anos ou compare com outro mapa da série.', 'Não há tom de concentração nesta experiência: uma imagem isolada não é uma série numérica para sonificar.', 'As cores e unidades estão no próprio mapa. O texto acessível não infere valores dos pixels.', 'O roteiro termina. Experimente outro ano ou use a comparação visual.']
    : type === 'temperature'
      ? ['This exploration uses monthly surface temperature anomalies from 2021. An anomaly is a difference from a reference, not an absolute temperature.', 'Blue indicates a negative anomaly, pale shades are near zero, and red indicates a positive anomaly. The displayed unit is Fahrenheit anomaly.', 'The map shows the NASA GISTEMP 2° by 2° grid. A text description accompanies the visualization.', 'Choose a month and a region. The regional average is aggregated from the grid and weighted by latitude.', 'The sound now follows the monthly series. Pitch rises with the anomaly and intensity increases slightly.', 'Sonification is an additional reading. Controls let you pause, resume, restart, stop and change volume.', 'The guide ends here. Continue exploring, return to a step or repeat an explanation.']
      : ['We are looking at ozone concentration over Antarctica. The ozone layer protects life by absorbing ultraviolet radiation.', 'Dobson Units measure total ozone in an atmospheric column. NASA uses 220 DU to define the area called the ozone hole.', 'Each image is a NASA Earth Observatory annual map for the day of greatest depth that year.', 'Select one of the eight years or compare it with another map in the series.', 'There is no concentration tone in this experience: a single image is not a numeric series to sonify.', 'The colors and units are shown on each map. Accessible text does not infer values from pixels.', 'The guide ends here. Try another year or use the visual comparison.'], [locale, type]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.showModal();
    setStep(0);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const current = descriptions[step];
    if (current) speak(current);
    if (type === 'temperature' && step === 4) onStartAudio?.();
  }, [step, open, descriptions, type, onStartAudio, speak]);

  function close() { dialogRef.current?.close(); setOpen(false); }
  function next() { if (step < descriptions.length - 1) setStep((current) => current + 1); else close(); }
  function previous() { setStep((current) => Math.max(0, current - 1)); }
  function repeat() { speak(descriptions[step] || ''); }
  function begin() { if (type === 'temperature') primeAudioContext(); setOpen(true); }

  return <>
    <button type="button" className="button button-secondary" onClick={begin}>{ui.start}</button>
    {open && <dialog ref={dialogRef} className="guide-dialog" aria-labelledby="guide-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => setOpen(false)}>
      <div className="guide-modal-head"><span className="eyebrow">{ui.title}</span><button type="button" className="icon-button" onClick={close} aria-label={copy[locale].common.close}><X size={18} /></button></div>
      <div className="guide-progress"><span>{ui.step} {step + 1} / {descriptions.length}</span><div className="progress-track"><span style={{ width: `${((step + 1) / descriptions.length) * 100}%` }} /></div></div>
      <p className="guide-index">{String(step + 1).padStart(2, '0')}</p><h2 id="guide-title">{titles[step]}</h2><p className="guide-body">{descriptions[step]}</p>
      <div className="guide-controls"><button className="button button-quiet" type="button" onClick={previous} disabled={step === 0}><ArrowLeft size={15} />{ui.prev}</button><button className="button button-small" type="button" onClick={repeat}><RotateCcw size={14} />{ui.repeat}</button><button className="button button-primary" type="button" onClick={next}>{step === descriptions.length - 1 ? ui.finish : ui.next}<ArrowRight size={15} /></button></div>
    </dialog>}
  </>;
}
