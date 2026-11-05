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
- Comandos de voz executam ações reais: “Abrir início”, “Começar exploração”, “Abrir temperatura”, “Explorar região fria”, “Explorar região quente”, “Ouvir dados”, “Pausar áudio”, “Retomar áudio”, “Parar áudio”, “Abrir camada de ozônio”, “Selecionar ano 2018”, “Ler descrição”, “Aumentar volume”, “Diminuir volume”, “Onde estou?”, “Voltar” e “Ajuda”; comandos equivalentes em inglês acompanham a seleção de idioma.
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
