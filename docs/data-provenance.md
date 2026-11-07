

## Biblioteca audiovisual NASA SVS

A página `/materiais` incorpora os recursos de mídia do NASA Scientific Visualization Studio. Textos, unidades, períodos, limites e arquivos são conferidos nas páginas-fonte, listadas junto de cada item em `src/data/nasaResources.ts`. Os vídeos são transmitidos diretamente dos servidores NASA SVS; não há ingestão de um serviço de terceiros nem alegação de uma API EIC ativa.

| Recurso | Fonte oficial | Mídia usada | Faixa de áudio do arquivo escolhido |
| --- | --- | --- | --- |
| Ozone Minimum Concentrations, 1979–2018 | https://svs.gsfc.nasa.gov/30889/ | https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030889/annual_ozone_min_v4_daily_720p.mp4 | sem faixa |
| Antarctic Ozone Sequence, 1979–2004 | https://svs.gsfc.nasa.gov/3264/ | https://svs.gsfc.nasa.gov/vis/a000000/a003200/a003264/ozone_NTSC.webmhd.webm | sem faixa |
| Greenland Ice Loss, 2002–2016 | https://svs.gsfc.nasa.gov/30879/ | https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030879/grace_greenland_720p.mp4 | sem faixa |
| Atmospheric CO₂ Trends | https://svs.gsfc.nasa.gov/30556/ | https://svs.gsfc.nasa.gov/vis/a030000/a030500/a030556/pumphandle_hyper_2022_1080p.webm | Opus estéreo, 48 kHz |
| 20 Years of Global Biosphere | https://svs.gsfc.nasa.gov/4596/ | https://svs.gsfc.nasa.gov/vis/a000000/a004500/a004596/biosphere7_mollweide_1080p30.webm | sem faixa |
| Amazon Deforestation | https://svs.gsfc.nasa.gov/30166/ | https://svs.gsfc.nasa.gov/vis/a030000/a030100/a030166/woc_AmazonDeforestation.webmhd.webm | sem faixa |
| Impact of Climate Change on Global Agricultural Yields | https://svs.gsfc.nasa.gov/4974/ | https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004974/AgMapMaize.webm | Opus estéreo, 48 kHz |
| Global Temperature Anomalies, 1880–2021 | https://svs.gsfc.nasa.gov/4964/ | https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004964/2021GISStempF-5yrAvg.webm | Opus estéreo, 48 kHz |
| NASA Climate Spiral, 1880–Present | https://svs.gsfc.nasa.gov/5190/ | https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005190/GISTEMP_Spiral_English_degC_2160p60.mp4 | sem faixa |

A presença/ausência refere-se somente a uma faixa técnica no arquivo de mídia exato indicado acima. Os fluxos foram inspecionados em 6 de novembro de 2026 com `ffprobe`; identificação da faixa não é transcrição, análise do conteúdo falado nem garantia sobre versões alternativas desses vídeos. Na interface, os três arquivos com faixa recebem o áudio nativo do player; os seis arquivos sem faixa continuam acessíveis pela narração em português/inglês do EarthSound, explicitamente identificada como narração criada pelo app. A leitura não simula uma medição sonora do fenômeno.

Notas científicas preservadas: a página de “Ozone Minimum Concentrations” traz uma discrepância interna — título/descrição indicam 1979–2018, mas uma legenda do vídeo indica 1979–2016 — e a animação mostra somente o mínimo anual. Na sequência de ozônio do Smithsonian, a página informa lacunas removidas em datas de 1998, 2002 e 2003; os conjuntos Ozone Depth/Size listados começam em 1996. Em CO₂, linhas de Mauna Loa, Polo Sul, tendência global e satélite AIRS/AMSU têm origens/intervalos distintos e não devem ser apresentadas como uma única série. Na biosfera, as cores do oceano (clorofila) e da terra (NDVI) representam variáveis diferentes. “Amazon Deforestation” representa Rondônia, não toda a Amazônia, e não publica uma escala numérica das cores. Agricultura são projeções condicionais de modelos até 2100, não resultados observados. O filme de temperatura GISTEMP tem quadros de média móvel de cinco anos; o quadro final é 2017–2021, não 2021 isolado. A espiral é uma série global agregada. Nenhum desses limites altera a origem NASA dos materiais.

## Sonificação dos materiais NASA

Cada um dos nove recursos da biblioteca `/materiais` agora tem uma experiência sonora EarthSound. Séries verificáveis são lidas de snapshots locais NASA/NOAA; quando a página publica apenas classes visuais, os botões reproduzem timbres qualitativos que não representam medições. O sincronismo com quadros só é afirmado quando a fonte o documenta; nos outros casos, a sequência/paleta sonora é independente. Fontes, unidades, intervalos, mapeamentos e limites por recurso estão em [material-sonification-sources.md](material-sonification-sources.md); o snapshot é regenerado por `python scripts/prepare_material_sonification.py`.
