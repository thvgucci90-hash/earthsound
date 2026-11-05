# Proveniência de dados do EarthSound

## Temperatura global

A experiência de 2021 usa GISTEMP v4 do NASA Goddard Institute for Space Studies (GISS). O arquivo local `public/data/gistemp-2021.json` é um recorte de doze meses da grade oficial regular de 2° × 2° “Land-Ocean Temperature Index, ERSSTv5, 1200km smoothing”, baixada de `https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz`. O campo original `tempanomaly` é reportado em kelvin como diferença, numericamente equivalente a uma anomalia em °C. A linha de médias globais mensais vem do CSV NASA `https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv`; a tabela descreve desvios em relação à média de 1951–1980. O arquivo NetCDF NASA consultado para o recorte registra geração em 22 de outubro de 2026. Valores são arredondados a três casas na grade local e convertidos de °C para °F quando mostrados.

A série global de 2021 no CSV consultado, em anomalias °C, é: jan 0,81; fev 0,64; mar 0,89; abr 0,76; mai 0,79; jun 0,85; jul 0,92; ago 0,81; set 0,92; out 0,98; nov 0,92; dez 0,88. Ela é dinâmica e pode ser revisada pela NASA. A interface preserva a anomalia como diferença relativa, nunca como temperatura absoluta.

Médias para as regiões escolhidas no EarthSound são agregações descritivas próprias das células da grade NASA, ponderadas por cos(latitude). São derivadas reproduzíveis da grade, não produtos oficiais da NASA para essas regiões. A legenda de cor é uma codificação visual da grade, e as leituras numéricas são calculadas a partir dos valores de dados. A grade NASA 1200 km é suavizada; sua resolução nominal 2° × 2° não deve ser lida como precisão local.

O script `scripts/prepare_gistemp.py` reproduz o recorte com Python e `netCDF4`; use `requirements-data.txt` para o ambiente de dados. Os arquivos fonte são públicos e sua proveniência permanece indicada na interface.

## Ozônio antártico

A timeline disponibiliza oito mapas anuais NASA Earth Observatory “World of Change: Antarctic Ozone Hole”: 1983, 1988, 1993, 1998, 2003, 2008, 2013 e 2018. As imagens são cópias locais dos recursos `ozone_YYYY.jpg` do acervo NASA Earth Observatory; os metadados da página atribuem a série a TOMS (1979–2004), OMI (2005–2011) e OMPS (2012–2019). Fonte: `https://science.nasa.gov/earth/earth-observatory/world-of-change/ozone-hole/`.

Dobson Unit (DU) é unidade de coluna total de ozônio. O mapa usa o limiar de 220 DU para identificar a área chamada de buraco; não significa que haja um vazio sem ozônio. A NASA explica que os mapas mostram o dia de maior profundidade e que máximos de área e mínimos de concentração podem ocorrer em anos diferentes. O EarthSound não estima números nem áreas a partir das cores dos pixels e, por isso, não faz sonificação quantitativa desses mapas. A página fornece leitura falada e comparação visual para os anos disponíveis.

## Ilustração da página inicial

A imagem Blue Marble usada como ilustração foi obtida no resultado “Earth — The Blue Marble” da NASA Science. Ela é decorativa/de contexto e não representa um mapa dos dados GISTEMP. Fonte: `https://science.nasa.gov/resource/blue-marble-earth/`. Crédito exibido: NASA.

## Material fornecido

O vídeo `EVOLUÇÃODO.mp4` serviu como referência visual: ozônio antártico aparece aproximadamente entre 00:04 e 00:50 e o mapa GISTEMP de 2021 por volta de 01:05–01:36. Ele lista escalas, datas e conceitos, mas não fornece arquivos originais de grade/serie em formato tabular. Quadros de anos não solicitados no controle não são renomeados nem usados como substitutos.
