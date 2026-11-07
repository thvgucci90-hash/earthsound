# Proveniência das sonificações da biblioteca NASA

Esta nota documenta o que cada som representa. O som é uma codificação de dados ou de categorias publicadas, não uma trilha decorativa. A faixa NASA e a sonificação EarthSound permanecem separadas. A interface não lê pixels do vídeo para inventar valores. Quando não há correspondência publicada entre dados e quadros, a sequência sonora é independente e não é apresentada como sincronização quadro a quadro.

## Mapeamentos por recurso

### Ozone Minimum Concentrations, 1979–2018 (`ozone-min`)

Usar os mínimos diários anuais de ozônio do Hemisfério Sul e as datas publicados pela [NASA Ozone Watch Annual Records](https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html), limitados a 1979–2018. Cada ano é um evento; maior DU sobe de registro e menor DU desce. 1995 não tem registro na tabela e deve permanecer como silêncio/ausência, sem interpolação. A tabela Ozone Watch é a série numérica; o MP4 NASA é mídia, não uma tabela. A página SVS informa divergência entre o título/intervalo detalhado e uma legenda legada do vídeo.

Fontes: [NASA SVS 30889](https://svs.gsfc.nasa.gov/30889/), [NASA Ozone Watch — Annual Records](https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html), [NASA Ozone Watch — arquivo de impressão](https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.txt), [NASA Earth Observatory — World of Change: Ozone Hole](https://science.nasa.gov/earth/earth-observatory/world-of-change/ozone-hole/).

### Smithsonian Exhibit: Antarctic Ozone Sequence 1979 through 2004 (`ozone-sequence`)

Sonificar os extremos anuais publicados pelo Ozone Watch — mínimo diário (DU) e área máxima diária do buraco (milhões de km²) — entre 1979 e 2004, como série companheira identificada, não como reconstrução exata dos quadros do vídeo. O tom segue o mínimo em DU; a faixa de área usa um registro separado. Ausências e sentinelas de dados faltantes ficam silenciosas, nunca preenchidas. O limiar de 220 DU define a área do buraco; DU e km² não são a mesma medida.

Fontes: [NASA SVS 3264](https://svs.gsfc.nasa.gov/3264/), [NASA Ozone Watch — Annual Records](https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html), [NASA Ozone Watch — mínimos diários](https://ozonewatch.gsfc.nasa.gov/meteorology/figures/ozone/to3mins_2003_toms+omi+omps.txt), [NASA Ozone Watch — área diária](https://ozonewatch.gsfc.nasa.gov/meteorology/figures/ozone/to3areas_2003_toms+omi+omps.txt), [definição de Dobson Unit](https://ozonewatch.gsfc.nasa.gov/facts/dobson_SH.html).

### Greenland Ice Loss 2002–2016 (`greenland`)

A página NASA relata perda média de aproximadamente 280 Gt/ano no período e classes cartográficas de perda (laranja/vermelho), ganho (azul-claro) e pouca mudança (branco). Oferecer o resumo numérico como evento único identificado como média publicada e uma paleta sonora qualitativa para as classes. Não criar uma série anual ou tratar dados Copernicus de outro produto/período como a série do vídeo.

Fontes: [NASA SVS 30879](https://svs.gsfc.nasa.gov/30879/), [inventário de mídia/metadados da NASA SVS](https://svs.gsfc.nasa.gov/api/30879), [NASA/JPL GRACE — Greenland ice loss](https://gracefo.jpl.nasa.gov/resources/33/greenland-ice-loss-2002-2016/).

### Atmospheric CO₂ Trends (`co2`)

Usar médias mensais de CO₂ em Mauna Loa, em ppm, de 1980 até setembro de 2014, a partir do arquivo NOAA GML. O tom sobe com a concentração publicada. A animação contém registros de fontes/instrumentos diferentes; a faixa EarthSound declara que sonifica apenas Mauna Loa, não a tendência global nem a série AIRS/AMSU. Não extrapolar AIRS além do período numérico verificado.

Fontes: [NASA SVS 30556](https://svs.gsfc.nasa.gov/30556/), [inventário de mídia/metadados da NASA SVS](https://svs.gsfc.nasa.gov/api/30556), [NOAA GML — CSV mensal Mauna Loa](https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv), [NOAA GML — dados e metodologia](https://gml.noaa.gov/ccgg/trends/data.html).

### 20 Years of Global Biosphere (updated) (`biosphere`)

A fonte distingue clorofila oceânica (mg/m³) de NDVI terrestre (adimensional), com legendas/escalas diferentes. Como não foi localizada uma série numérica única e harmonizada correspondente aos quadros, oferecer botões de prévia sonora para as categorias explicitamente descritas na legenda: classes oceânicas de clorofila baixa/mais alta e classes terrestres de vegetação escassa/abundante. São timbres interpretativos, sem leitura de pixel ou comparação numérica entre as duas variáveis.

Fontes: [NASA SVS 4596](https://svs.gsfc.nasa.gov/4596/), [NASA Ocean Color Level 3/4 Browser](https://oceancolor.gsfc.nasa.gov/l3/), [NASA Earthdata — SeaWiFS chlorophyll](https://www.earthdata.nasa.gov/data/catalog/ob-cloud-seawifs-l3m-chl-2022.0), [NASA Earthdata — NDVI](https://www.earthdata.nasa.gov/topics/land-surface/normalized-difference-vegetation-index-ndvi).

### Amazon Deforestation (`amazon`)

A página NASA descreve categorias visuais em Rondônia, 2000–2010: floresta intacta (verde-escuro), solo/área aberta (castanho) e culturas/pastagens (verde-claro). Cada categoria recebe uma prévia sonora distinta, declarada qualitativa. O recurso não declara área, taxa, unidade, cadência dos quadros nem série anual. Não usar dados de outra página como se fossem valores deste vídeo.

Fontes: [NASA SVS 30166](https://svs.gsfc.nasa.gov/30166/), [inventário de mídia/metadados da NASA SVS](https://svs.gsfc.nasa.gov/api/30166), [NASA Terra — dados MODIS](https://terra.nasa.gov/data/modis-data).

### Impact of Climate Change on Global Agricultural Yields (`agriculture`)

Sonificar somente os resumos da própria página NASA para o fim do século sob cenário SSP5-8.5: rendimento global de milho −24% e de trigo aproximadamente +17%. São dois resultados projetados, não observações. Cada um tem um motivo curto em direção distinta, dentro da escala do mapa; não inventar valores anuais nem interpolar a animação. O artigo científico reporta cerca de +18% para trigo; a interface seleciona o valor arredondado mostrado pela página NASA e deixa a proveniência explícita.

Fontes: [NASA SVS 4974](https://svs.gsfc.nasa.gov/4974/), [NASA — impactos climáticos em cultivos](https://www.nasa.gov/earth-and-climate/global-climate-change-impact-on-crops-expected-within-10-years-nasa-study-finds/), [Jägermeyr et al., Nature Food, 2021](https://www.nature.com/articles/s43016-021-00400-y).

### Global Temperature Anomalies from 1880 to 2021 (`temperature`)

Usar a série anual global L-OTI de GISTEMP v4 em °C de anomalia, referência 1951–1980. Agrupar valores oficiais em janelas móveis consecutivas de cinco anos para acompanhar o período mostrado no filme (1880–1884 até 2017–2021). É a média global associada, não a distribuição espacial dos mapas nem uma leitura de pixels. Valores positivos sobem de registro e negativos descem; as janelas usam apenas dados publicados, sem preencher meses/anos faltantes.

Fontes: [NASA SVS 4964](https://svs.gsfc.nasa.gov/4964/), [NASA GISTEMP v4 — CSV mensal/global](https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv), [NASA GISTEMP v4 — downloads](https://data.giss.nasa.gov/gistemp/data_v4.html).

### NASA Climate Spiral 1880–Present (`climate-spiral`)

Usar os valores mensais globais L-OTI de GISTEMP v4 em °C de anomalia, referência 1951–1980, do CSV diretamente ligado à visualização NASA. Cada mês é um evento; valores ausentes permanecem sem som e sem interpolação. O mapeamento frequência–°C é uma convenção auditiva do EarthSound, não uma escala física NASA. A sequência é tocada como série própria; sem timecodes verificados, não se afirma que cada nota coincida com o quadro radial correspondente.

Fontes: [NASA SVS 5190](https://svs.gsfc.nasa.gov/5190/), [NASA GISTEMP v4 — CSV mensal/global](https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv), [NASA GISTEMP v4 — downloads](https://data.giss.nasa.gov/gistemp/data_v4.html).

## Reprodução dos dados locais

`python scripts/prepare_material_sonification.py` descarrega apenas a tabela anual NASA Ozone Watch e as tabelas NOAA Mauna Loa e NASA GISTEMP citadas no script. A saída versionada é um instantâneo reduzido com os pontos usados pelo site, fonte, unidades, período e data de acesso. A aplicação não consulta nem depende de API durante a reprodução. Modos qualitativos e resumos agrícolas/Greenland não são séries artificiais: representam somente categorias ou estatísticas textuais publicadas nas páginas NASA indicadas.
