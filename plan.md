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


## Extensão aprovada — correções de fala e biblioteca NASA

A solicitação de 2026-11-06 requer corrigir os bugs relatados no comando de voz e na leitura em voz alta, integrar interativamente todos os recursos da coleção compartilhada no Notion e atualizar o Git. A página “Arquivos” expõe materiais do NASA Scientific Visualization Studio sobre ozônio antártico (duas animações históricas), perda de gelo na Groenlândia, tendências de CO₂ atmosférico, biosfera global, desmatamento na Amazônia, rendimentos agrícolas sob mudança climática, anomalias globais de temperatura 1880–2021 e a espiral climática NASA. A implementação mantém proveniência e alegações específicas somente após conferência de cada página NASA oficial.

### Leitura e reconhecimento de voz

Substituir a síntese fragmentária do contexto por um mecanismo de narração controlado, com fila de enunciados curtos, cancelamento previsível, pausa/retomada, erro/indisponibilidade e seleção de voz compatível com `pt-BR` ou `en-US`. A ação de “ler esta página” extrai o conteúdo semântico da página ativa (títulos, explicações, descrições e legendas, sem a navegação repetida nem rótulos de botões), e as ações de ler descrição continuam específicas de cada visualização. Anúncios para leitores de tela comunicam o estado da leitura sem repetir toda a narração no canal live.

A camada Web Speech recognition permanece progressiva: comandos normalizados executam somente as ações mapeadas, ignoram resultados duplicados e não interpretam a síntese de saída como nova entrada. Erros `no-speech`, permissão, rede, indisponibilidade ou fim inesperado geram estados localizados e permitem reiniciar manualmente. Troca de idioma não mantém um reconhecedor com locale antigo. Firefox e browsers sem reconhecimento mantêm uma alternativa de teclado/controles. Nenhuma integração de microfone ou serviço externo é declarada como obrigatória.

### Biblioteca audiovisual NASA

Criar `src/data/nasaResources.ts` com metadados auditados e `src/pages/MaterialsPage.tsx` com filtros, cards navegáveis e um player acessível para a mídia oficial, acompanhado de fonte, período, descrição, controles de áudio/vídeo e botão de leitura pt-BR/EN. Organizar os temas (ozônio, criosfera, atmosfera, biosfera, Amazônia, agricultura e temperatura/clima) sem confundir observação com projeção. Recursos remotos são streamados pela origem NASA, sem baixar MP4 muito grandes para a build estática; a UI trata indisponibilidade de rede com link à fonte. Se houver faixa de áudio original, usar o áudio do player; narração EarthSound é identificada como tal. Séries numéricas existentes podem usar sonificação apenas quando o dado e a transformação estejam disponíveis e explicitados. Não se infere dado numérico dos pixels dos vídeos nem se sonifica por valor uma animação visual sem suporte quantitativo. Mídias ficam separadas das duas explorações atuais (ozônio em mapas fixos e GISTEMP 2021 sincronizado).

Responsabilidades de novos módulos: `src/hooks/useSpeechSynthesis.ts` administra a fila e o ciclo de leitura; `src/data/nasaResources.ts` mantém a lista auditada; `src/pages/MaterialsPage.tsx` e componentes pequenos de biblioteca/player exibem conteúdos com provenance; `src/data/i18n.ts` traduz textos funcionais PT/EN; `src/components/Shell.tsx`, `src/pages/CatalogPage.tsx`, `src/App.tsx` e `public/manus-routes.json` integram o acesso às rotas existentes e `/materiais`. README e documentação de proveniência descrevem fontes, reprodução e limites. O projeto continua SPA estática React + TypeScript + Vite, sem servidor adicional.

Após build e revisão do comportamento, manter o site existente publicado com o mesmo endereço e atualizar os arquivos Git no repositório de usuário conectado, sem expor/alterar segredos e preservando o `origin` interno do WebDev. A publicação de novos arquivos à URL pública exige um novo checkpoint e a operação Publish autorizada no contexto de atualização do MVP; a visibilidade do site permanece pública.


### Alternativa por texto para navegadores sem reconhecimento de voz

A central de acessibilidade também oferecerá um campo de comando textual. Ele usa o mesmo parser pt-BR/EN da fala e o mesmo despacho de ações; não requer microfone, extensão ou serviço externo. Isso permite executar os comandos em Firefox e outros navegadores sem SpeechRecognition, sem anunciar que o próprio navegador reconhece voz quando não reconhece.


### Comandos vocais de leitura

“Pausar leitura”, “Retomar leitura” e “Parar leitura” são comandos distintos dos controles de áudio científico. A confirmação de estado é acessível sem interromper indevidamente a fila de voz; quando a leitura está pausada, o reconhecimento pode voltar a escutar para aceitar “Retomar leitura”. Interromper a síntese antes da confirmação evita que o microfone capte a própria voz gerada e crie uma sequência de comandos acidental.

Os mesmos três comandos ficam disponíveis em inglês (“Pause reading”, “Resume reading”, “Stop reading”), na lista falada e no campo textual; Escape interrompe a leitura e o áudio ativo. Se a voz TTS estiver falando, o microfone aguarda sua conclusão e retoma sem anunciar continuamente a mesma mensagem em silêncio.


## Extensão aprovada — sonificação individual dos materiais NASA

A nova solicitação amplia a biblioteca existente sem substituir seus filtros, player, descrições, fonte ou narração: cada um dos nove recursos NASA tem uma camada sonora própria EarthSound, acionável pelo usuário, além da faixa original NASA quando houver. A camada só acompanha o tempo/estado do vídeo quando a fonte publica e verifica a correspondência com valores/datas; nos demais casos, oferece sequência ou paleta interativa separada e informa esse limite. Dados numéricos são sonificados quantitativamente somente a partir de séries oficiais verificadas, com variável, unidade, referência e período visíveis. Se a animação publicar apenas estados/categorias visuais, oferecer tradução sonora qualitativa desses estados documentados, identificada como interpretativa e não quantitativa; nunca derivar medições de pixels, inventar valores ou interpolar séries. Se a fonte não sustentar sequer uma tradução qualitativa honesta, interromper a implementação daquele perfil e pedir os dados/fonte faltante ao usuário em vez de fingir sonificação científica.

A estrutura inclui `src/data/materialSonification.ts` para perfis tipados, `src/data/materialSonificationSeries.ts` para snapshots locais oficiais, `scripts/prepare_material_sonification.py` para regenerá-los, e `src/hooks/useMaterialSonification.ts` para Web Audio, estado de reprodução e limpeza. `src/pages/MaterialsPage.tsx` incorpora controles e legenda sonora no painel atual; `src/App.tsx` carrega a biblioteca sob demanda. São preservados os nove vídeos, filtros, narração, player original e links NASA. Sonificação e áudio original permanecem em canais controláveis separadamente, sem reprodução automática; os controles incluem iniciar/pausar/retomar/parar/reiniciar e volume, são operáveis por teclado, têm equivalentes PT/EN e anunciam valor/estado em texto acessível.


**Limite de sincronização:** a camada sonora acompanha o `currentTime` do vídeo somente quando a fonte documenta a correspondência entre valores/datas e quadros/tempo. Quando a série numérica é relacionada mas não é exatamente a série do vídeo, ou quando a fonte só identifica categorias, a experiência sonora funciona como sequência/paleta independente e declara essa diferença; não simula sincronismo quadro a quadro.


## Extensão: identidade visual original e marca d’água
Criar um símbolo EarthSound original, abstrato e facilmente reconhecível em tamanho pequeno: contornos de planeta combinados a uma onda sonora, em ciano/azul-petróleo com pequeno acento amarelo, sem NASA insignia, wordmark NASA ou imitação de marca existente. A aplicação usa o símbolo como marca no cabeçalho e marca d’água discreta somente no chrome da interface (cabeçalho/rodapé); não sobrepor, redesenhar, obscurecer ou alterar vídeos, mapas, gráficos, dados, escalas, legendas, fontes ou qualquer parte verificável. A palavra EarthSound permanece como texto real da interface para manter tipografia precisa. Entregar também um JPEG quadrado independente com o mesmo símbolo sobre fundo azul profundo para o perfil da equipe no Space Apps. Atualizar o `logoUrl` literal em `app.config.ts` para um endereço HTTPS durável do símbolo, preservando os demais campos, e incluir os ativos no projeto/GitHub antes do checkpoint e publicação.