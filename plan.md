# EarthSound — plano de implementação aprovado e realizado

## Objetivo e decisões

Construir um MVP utilizável de “The Earth Information Jukebox” com React, TypeScript e Vite: escolher uma visualização ambiental da NASA, explorar o dado, acompanhar uma sonificação sincronizada e receber explicações acessíveis. A aplicação é estática, sem backend, e atende português/inglês. Navegação por teclado, leitor de tela, controles visuais e recursos de áudio funcionam independentemente do reconhecimento de voz. Firefox e navegadores sem Web Speech recognition têm alternativas convencionais explícitas; nunca se promete compatibilidade universal de microfone.

O catálogo oferece duas explorações distintas. Temperatura global mostra os 12 mapas mensais de 2021 a partir da grade NASA GISS GISTEMP v4 2° × 2°, com anomalias em relação a 1951–1980, a escala correspondente ao material visual do usuário e regiões derivadas dos valores observacionais. Ozônio antártico mostra mapas originais NASA Earth Observatory nos anos selecionados (1983, 1988, 1993, 1998, 2003, 2008, 2013 e 2018), com fonte/ano preservados. Os fenômenos e as unidades permanecem separados. O EarthSound não infere áreas ou concentrações a partir de pixels de mapas de ozônio.

## Implementação e arquitetura

- `src/App.tsx`: rotas e despacho global de comandos por voz; mudança de rota com foco gerenciado.
- `src/components`: casca e navegação persistentes, idiomas, estados de acessibilidade, introduções, visualização SVG, controles de som e roteiro dialogal reutilizável.
- `src/pages`: página inicial, catálogo, exploração de temperatura, mapas de ozônio e central de acessibilidade.
- `src/context/AppContext.tsx`: idioma PT/EN, volume, leitura falada, anúncios acessíveis e preferências persistidas no dispositivo.
- `src/data/i18n.ts`: textos, rótulos, descrições, ajuda e comandos nos dois idiomas.
- `src/hooks/useSonification.ts`: Web Audio compartilhado, reprodução indexada por mês, seleção de valor, controles e sincronização com o mapa.
- `src/lib/temperature.ts`: carregamento e leitura da grade, conversões, agregações regionais por latitude e mapeamento de anomalia para som/cor.
- `public/data/gistemp-2021.json`: recorte local dos 12 meses da grade NASA, após validação da origem e dos metadados.
- `public/images/ozone`: oito mapas anuais NASA utilizados pela timeline; `public/images/earth/blue-marble.jpg` fornece contexto visual, sem ser apresentado como dado GISTEMP.
- `scripts/prepare_gistemp.py`, `requirements-data.txt`, `docs/data-provenance.md` e `README.md`: reprodução do recorte e rastreabilidade das fontes, conversões, limitações e instruções.

O React Router organiza `/`, `/catalogo`, `/explorar/temperatura`, `/explorar/ozonio` e `/acessibilidade` (além do atalho `/inicio`). Um único documento de rota declara essas páginas para o ambiente WebDev. O frontend serve build Vite estática, sem chamar API NASA durante a navegação e sem apresentar integração EIC não existente como se fosse conexão ativa.

### Dados e representação térmica

O recorte deriva de `gistemp1200_GHCNv4_ERSSTv5.nc.gz` (NASA GISS) e da tabela mensal global NASA. A grade regular tem 90 linhas de latitude e 180 colunas de longitude. O campo `tempanomaly`, em K como diferença, é numericamente equivalente à anomalia em °C. A interface converte anomalias para °F quando mostra a leitura pontual e registra a referência 1951–1980. Células são desenhadas em SVG; as regiões são retângulos geográficos próprios do EarthSound e suas médias ponderam cos(latitude), não produtos regionais oficiais da NASA. A legenda explicita saturação além de ±4 °F, e a descrição informa suavização GISTEMP de 1200 km e ausência de precisão local.

### Sonificação

O som usa Web Audio API: altura/frequência cresce com a anomalia, intensidade varia levemente e cada pulso representa um mês. O valor e o mês sonificados são os mesmos visíveis no mapa e na série temporal. Reproduzir, pausar, retomar, parar, reiniciar, velocidade e volume têm controles convencionais e estados textuais/visuais. Frequência e intensidade aparecem em texto e indicadores; o som não é trilha decorativa. Imagens anuais isoladas de ozônio não formam uma série numérica suficientemente confiável para sonificação quantitativa; essa ausência e sua alternativa falada são explicadas deliberadamente.

### Acessibilidade e exploração guiada

HTML semântico, textos alternativos, descrições equivalentes dos SVGs/gráficos, unidades, mensagens anunciadas, foco perceptível e navegação por Tab/Shift+Tab/Enter/Espaço/Escape. Preferências incluem alto contraste, ampliação de fonte, movimento reduzido e volume. Síntese de voz usa a voz pt-BR/en disponível no navegador, com ler/pausar/retomar/parar. Comandos de voz pedem ativação/permite detectar permissão e recurso, reportam desativação, escuta, reconhecimento, incompreensão ou falta de suporte, e acionam rotas, meses/anos, áudio, descrição e volume. Recursos sem suporte não bloqueiam o restante.

A exploração guiada conduz em sete etapas: fenômeno, leitura/escala, mapa, interação, sonificação ou comparação, interpretação e exploração livre. Permite avançar, voltar, repetir e sair. O contexto de áudio é desbloqueado por gesto explícito antes da etapa guiada de reprodução.

## Design aplicado

- **Movimento:** cartografia científica editorial e painéis de observatório; referência NASA sem apropriar-se do logotipo NASA.
- **Princípios:** proveniência explícita; dados e som em paralelo; explicação simples antes de decoração; acessibilidade como padrão.
- **Cores:** azul profundo e quase preto estabelecem foco; ciano identifica estado/seleção e atividade; amarelo funciona como ênfase/foco. Gradiente frio–quente vem sempre com legenda e descrição textual.
- **Layout:** navegação horizontal persistente; abertura editorial assimétrica; mapa grande acompanhado por seletor regional e temporal; linha mensal e painel sonoro; conteúdo de fonte sempre junto da experiência.
- **Motivos:** coordenadas e grade, órbitas finas, onda sonora e marcas de escala inspiradas em instrumentação.
- **Interação:** manipulação direta, alternativas visuais e retorno textual; estados acessíveis; nenhuma ação depende de hover ou microfone.
- **Animação:** transições breves e discretas, onda e sinal com propósito; nenhum significado depende de animação; respeitar `prefers-reduced-motion` e a preferência interna.
- **Tipografia:** Manrope para títulos/interface e DM Mono para coordenadas, valores e unidades, com fontes de sistema como fallback.
- **Essência da marca:** para pessoas que querem ouvir e explorar evidência ambiental em uma interface inclusiva. Personalidade: precisa, curiosa, acolhedora.
- **Tom de voz:** convite direto sem extrapolar evidências. Exemplos: “A anomalia se afasta da referência — acompanhe a mudança no tom.” / “A camada de ozônio e o aquecimento global contam histórias diferentes.”
- **Logotipo:** EarthSound associado a círculo orbital e traço de onda, em SVG reconhecível em tamanhos pequenos, sem imitar insígnias NASA.
- **Cor de assinatura:** ciano EarthSound `#4ED9DF`.

## Fontes e proveniência na interface

- NASA GISS, GISTEMP v4 e grids: https://data.giss.nasa.gov/gistemp/ e https://data.giss.nasa.gov/gistemp/data_v4.html.
- Grade: https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz.
- Série global mensal: https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv.
- NASA Scientific Visualization Studio, período GISTEMP 1880–2021: https://svs.gsfc.nasa.gov/4975/.
- NASA Earth Observatory, “World of Change: Antarctic Ozone Hole”: https://science.nasa.gov/earth/earth-observatory/world-of-change/ozone-hole/.
- NASA Blue Marble: https://science.nasa.gov/resource/blue-marble-earth/.
- Vídeo anexado: referência visual para mapas GISTEMP de 2021 e o segmento NASA Ozone Watch; não substitui grade/dados numéricos nem autoriza atribuir anos incorretos a quadros.

README e documentação local explicam instalação, execução e build estática, comandos de voz, suporte progressivo, unidades, período-base, cálculo regional, sensores dos mapas de ozônio e limitações científicas.
