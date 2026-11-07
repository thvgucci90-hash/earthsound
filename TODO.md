# EarthSound — entregas e critérios

## 1. Início, catálogo e navegação

- Apresentar nome e identidade visual EarthSound, slogan “Ouça o planeta. Compreenda suas transformações.”, explicação breve de que a pessoa visualiza dados ambientais e os ouve, botões “Começar exploração” e “Como funciona”, destaque visual com a Terra/dados/ondas sonoras e acesso permanente à central de acessibilidade.
- Disponibilizar página inicial e catálogo de visualizações científicas; usuário escolhe uma visualização científica, vê sua visualização correspondente, lê uma explicação e ouve a sonificação correspondente.
- Implementar navegação entre páginas, rotas, links e botões que levam às respectivas experiências; em telas menores a interface permanece responsiva.
- Oferecer experiência livre e acesso à “Exploração guiada”.
- Incluir seletor de idioma português/inglês; conteúdo essencial, controles, descrições, textos alternativos, anúncios de estado e orientação falada acompanham o idioma escolhido.

## 2. Exploração de temperatura global e mapas de 2021

- Tornar temperatura global a experiência principal e usar como referência os mapas de 2021 presentes no vídeo anexado.
- Permitir explorar a transição entre regiões frias e quentes, movimentar um controle interativo ou selecionar regiões e fazer o áudio mudar de acordo com a seleção.
- Apresentar legenda visual e sonora que explica a relação temperatura–som.
- Explicar que mapas de anomalia de temperatura representam diferenças em relação a uma referência, não necessariamente a temperatura absoluta de cada região.
- Utilizar dados reais sempre que disponíveis e atribuir as fontes e unidades. Se os dados numéricos espaciais originais não estiverem disponíveis, identificar claramente como demonstração conceitual; não utilizar valores fictícios como se fossem medições científicas.
- Informar limitações dos dados, período de referência, estados de carregamento/erro e distinguir valores derivados de medições de parâmetros demonstrativos.
- Garantir que visualização de dados e som representem a mesma informação e permaneçam próximos para acompanhamento simultâneo.

## 3. Camada de ozônio antártica

- Adicionar experiência complementar e separada sobre a evolução histórica do ozônio sobre a Antártida nos anos 1983, 1988, 1993, 1998, 2003, 2008, 2013 e 2018.
- Disponibilizar linha do tempo interativa, seleção de ano, comparação histórica, visualização correspondente quando disponível e explicação de unidades Dobson (DU).
- Não inventar valor de concentração nem extensão do buraco. Se visualização de determinado ano não estiver disponível, expor isso claramente e não rotular quadro de outro ano como se fosse a seleção solicitada.
- Não confundir redução da camada de ozônio com aquecimento global; explicar separadamente ambos os fenômenos.
- Sonificar variações de concentração apenas quando os dados numéricos confiáveis estiverem disponíveis.

## 4. Sonificação e controles de áudio

- Implementar mecanismo real com Web Audio API ou equivalente para transformar parâmetros/dados em frequência, altura, intensidade, duração, ritmo, variações temporais e, se útil, diferentes camadas sonoras; o áudio não é música de fundo decorativa.
- Nos dados de temperatura: sons mais graves e suaves para regiões frias, frequências intermediárias para regiões intermediárias e sons mais agudos com intensidade ligeiramente maior para regiões mais quentes.
- Permitir ouvir em tempo real, pausar/retomar, parar, reiniciar, ajustar volume e velocidade; sincronizar áudio e visualização sempre que possível.
- Fornecer controle visual e texto para características sonoras; nenhuma informação importante é transmitida exclusivamente pelo som.
- Permitir ouvir a explicação do significado dos sons.
- Todas as ações de botões e controles de áudio funcionam e exibem seu estado atual.

## 5. Acessibilidade, fala e comandos de voz bilíngues

- Implementar reconhecimento de voz pt-BR quando suportado e usar o idioma selecionado (PT-BR/EN-US) quando a API permitir; oferecer botão visível de ativação/desativação do microfone, pedir permissão no momento apropriado e tratar recusa/indisponibilidade.
- Exibir estado textual de microfone desativado, aguardando comando, escutando, comando reconhecido e comando não compreendido; confirmar verbalmente comandos reconhecidos.
- Comandos de voz executam ações reais: “Abrir início”, “Abrir materiais NASA”, “Começar exploração”, “Abrir temperatura”, “Explorar região fria”, “Explorar região quente”, “Ouvir dados”, “Pausar áudio”, “Retomar áudio”, “Parar áudio”, “Pausar leitura”, “Retomar leitura”, “Parar leitura”, “Abrir camada de ozônio”, “Selecionar ano 2018”, “Ler descrição”, “Ler esta página”, “Aumentar volume”, “Diminuir volume”, “Onde estou?”, “Voltar” e “Ajuda”; comandos equivalentes em inglês acompanham a seleção de idioma.
- Implementar leitura em voz alta pt-BR e EN para apresentação inicial, visualizações, fenômenos, instruções de navegação, legendas dos gráficos, significado da sonificação e confirmação de ações, com comandos para iniciar, pausar e interromper a leitura.
- Implementar suporte progressivo a navegadores: detectar recursos disponíveis; voz não é indispensável para navegação. Firefox e navegadores sem reconhecimento de voz oferecem alternativa visível e mantêm navegação, gráficos, áudio, teclado e demais recursos funcionais.

## 6. Acessibilidade visual, auditiva e motora

- Usar HTML semântico, compatibilidade com leitores de tela, texto alternativo para imagens, descrição textual equivalente de cada gráfico explicando o que representa e padrões observados, títulos hierárquicos, rótulos acessíveis para todos os controles, anúncios de estado e foco visível.
- Permitir uso completo sem mouse, com Tab/Shift+Tab para navegação, Enter/Espaço para ativar controles, Escape para interromper áudio ou fechar elementos e ordem de foco lógica.
- Não depender exclusivamente de cores para transmitir informação. Nenhuma informação importante fica apenas no som; oferecer legendas, descrições, indicadores visuais de frequência e intensidade e controles visuais equivalentes.
- Disponibilizar central de acessibilidade com alto contraste, aumento de tamanho da fonte, redução de movimento, controle de volume, leitura em voz alta e ativação/desativação de reconhecimento de voz.
- Manter foco indicado e informação legível nos tamanhos de fonte ampliados, em alto contraste, com movimento reduzido e nas telas menores.

## 7. Exploração guiada e conteúdo compreensível

- A experiência guiada apresenta o fenômeno ambiental, explica o que será visualizado, mostra gráfico/mapa, orienta a interação, inicia a sonificação, explica o significado do som e permite avançar, voltar e repetir cada passo.
- O usuário pode escolher entre explorar livremente ou receber orientação passo a passo.
- Explicações científicas em linguagem simples distinguem evidência, anomalia, unidades, referência e demonstração conceitual.

## 8. Entrega e robustez técnica

- Implementar a aplicação com React, TypeScript e Vite, arquitetura modular e componentes reutilizáveis, rotas navegáveis, responsividade e funcionamento em navegadores modernos.
- Criar uma arquitetura preparada para dados reais da NASA EIC; não simular integrações externas como se fossem reais. Se não houver API ou dados disponíveis, utilizar arquivos locais de demonstração claramente identificados.
- Tratar suporte do microfone, estados de carregamento/erro e compatibilidade com navegadores sem bloquear as alternativas funcionais.
- Disponibilizar código organizado e executável e instruções para instalação, desenvolvimento e build.
- Cobrir a experiência completa solicitada: o usuário entra, inicia a exploração, seleciona visualização, compreende o fenômeno pela descrição, observa a resposta auditiva, usa os controles de áudio, aciona comandos de voz quando suportados, recebe orientação falada, navega sem mouse, consulta descrição textual dos gráficos e usa a interface em tela menor. Limitações científicas e técnicas estão claramente informadas.


## 9. Correção de comandos de voz e leitura em voz alta — solicitação de 2026-11-06

- O usuário relatou: “o mvp apresentou bugs no comando de voz, leitura”. Corrigir o reconhecimento e a leitura falada nas páginas e controles existentes; manter o idioma selecionado, tratar retomada/interrupção, comandos repetidos, permissões, indisponibilidade e mensagens de estado, sem bloquear navegação por teclado, mouse ou controles convencionais.
- Ler em voz alta o conteúdo útil da página atual, seus títulos, explicações, legendas e descrições, em PT-BR/EN, não apenas um resumo fixo genérico; fornecer ações funcionais para iniciar, pausar, retomar e interromper a leitura, com estado acessível.
- Os comandos continuam executando ações reais e têm alternativas convencionais; a confirmação de comando não deve cancelar imediatamente a leitura solicitada nem criar um ciclo causado pela captação do próprio áudio. Quando o navegador não oferece reconhecimento de voz (por exemplo, Firefox), uma alternativa visível por texto deve aceitar os mesmos comandos e despachar as mesmas ações, sem exigir microfone.

## 10. Biblioteca interativa de materiais NASA compartilhados no Notion

- O usuário solicitou: “quero a implementação desses materiais no mvp de maneira interativa com audios etc:” seguido de https://app.notion.com/p/Arquivos-3fc7afa0b0a9806a8813edac2ee4bdde?source=copy_link.
- Incorporar na navegação e no catálogo do EarthSound os recursos NASA listados nessa página: “Ozone Minimum Concentrations, 1979–2018”; “Smithsonian Exhibit: Antarctic Ozone Sequence 1979 through 2004”; “Greenland Ice Loss 2002–2016”; “Atmospheric CO₂ Trends”; “20 Years of Global Biosphere (updated)”; “Amazon Deforestation”; “Impact of Climate Change on Global Agricultural Yields”; “Global Temperature Anomalies from 1880 to 2021”; e “NASA Climate Spiral 1880–Present”. Manter títulos, links e proveniência oficiais.
- Cada recurso é selecionável e abre mídia oficial utilizável no app (player com controles de vídeo e áudio disponíveis pela fonte), com título, descrição inteligível, período, fonte e texto acessível. Oferecer narração falada em português e inglês, bem como pausa/retomada/parada e controle visual de reprodução; oferecer seleção de períodos/cenas somente quando a mídia permitir.
- Preservar mídia/áudio originais da NASA quando publicados; quando uma animação não tiver trilha falada ou sonora confirmada, oferecer explicação falada pt-BR/EN e deixar claro que é narração do EarthSound. Não dizer que o vídeo possui áudio se isso não foi verificado.
- Sonificar numericamente uma visualização apenas quando existir série numérica confiável e seu mapeamento puder ser explicado; não inferir valores dos pixels dos vídeos/mapas nem criar medições ou resultados científicos. Para material apenas visual, manter reprodução interativa, leitura/narração e áudio descritivo sem falsa sonificação quantitativa.
- Permitir buscar/filtrar materiais por fenômeno/categoria e voltar ao catálogo/experiências existentes; manter foco, operação por teclado, leitores de tela, textos PT/EN, layout responsivo e estado de falha caso mídia remota não carregue.

## 11. Sincronização da entrega Git

- O usuário solicitou: “apos fazer as correcoes ajuste tudo no git tambem”. Após implementar e compilar as correções e o novo conteúdo, registrar as mudanças no histórico do projeto e sincronizar a branch principal do repositório GitHub existente `thvgucci90-hash/earthsound`, preservando o remote `origin` interno do WebDev e sem alterar a visibilidade privada já selecionada para o código.


## 12. Sonificação individual dos materiais gráficos NASA — solicitação de 2026-11-07

- O usuário solicitou: “sobre os materiais graficos da nasa, gostaria que criasse sonificacoes para cada um deles, mantendo a mesma estrutura mas add o som que é o ponto principal do projeto”.
- Adicionar uma camada própria de sonificação EarthSound a cada um dos nove materiais NASA já listados no item 10, mantendo a estrutura atual da biblioteca, os mesmos filtros, cards, player, metadados, links oficiais e narração; o som deve ser uma leitura do conteúdo científico, não música decorativa.
- Sincronizar o estado sonoro com a linha de tempo do vídeo quando houver: acompanhar iniciar, pausa, retomada, busca/avanço, velocidade, parada e seleção de outro material; atualizar o indicador textual/visual do trecho sonificado. O som só inicia após ação explícita da pessoa.
- Usar séries numéricas oficiais verificadas para sonificação quantitativa, exibindo variável, unidade, período/referência, fonte e explicação do mapeamento dado→som. Para animações sem série quantitativa disponível, oferecer apenas tradução sonora qualitativa de estados/categorias explicitamente documentados pela fonte NASA, identificada como interpretativa e não quantitativa; não inferir medições por pixels, inventar números ou interpolar valores.
- Manter trilha original NASA, sonificação EarthSound e narração distintas e controláveis; volume e iniciar/pausar/retomar/parar/reiniciar devem funcionar sem confusão entre os canais. Fornecer descrição textual e estado acessível equivalentes ao som.
- Manter textos e controles em português e inglês, operação completa por teclado e leitor de tela, responsividade, redução de movimento e as alternativas existentes para navegadores sem reconhecimento de voz.
- Se uma fonte não fornecer dados numéricos nem estados/categorias documentados suficientes para uma tradução sonora honesta, não simular a sonificação científica: registrar o limite e solicitar dados/fonte ao usuário antes de apresentar um som como representativo.
- Sincronizar a sonificação com o vídeo apenas quando a correspondência entre valores/datas e quadros/tempo estiver documentada e verificada. Quando a série numérica for relacionada, mas não a série exata do vídeo, ou quando houver apenas estados/categorias, manter a sequência/paleta sonora interativa separada e informar que não há sincronização quadro a quadro.
