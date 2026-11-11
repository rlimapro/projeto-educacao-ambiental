# Design — estilo Carvão

Referência visual: o protótipo de alta fidelidade no Figma ([App de Emissões](https://www.figma.com/design/HlJaNtDhNHMXjLkzh4tK47/App-de-Emiss%C3%B5es)), com as telas nos temas claro e escuro. Quando o protótipo e este documento divergirem, a equipe decide e este documento é atualizado. O arquivo não usa variáveis do Figma; as cores dele são exatamente os tokens abaixo.

O estilo combina tipografia geométrica para números, um verde-limão como marca e superfícies discretas. O tema claro é o padrão; o escuro é opcional.

## Telas do protótipo

Identificadores dos nós no Figma (arquivo `HlJaNtDhNHMXjLkzh4tK47`), usados para ler cada tela pelo servidor MCP do Figma. O processo de implementação está na skill `nova-tela`.

| Tela | Claro | Escuro | Implementada |
| --- | --- | --- | --- |
| 01 Boas-vindas · O app | `4:2` | `7:2` | Sim (`src/app/boas-vindas.tsx`) |
| 02 Boas-vindas · Privacidade | `4:21` | `7:21` | Sim |
| 03 Boas-vindas · Perfil | `4:59` | `7:59` | Sim |
| 04 Início | `2:2` | `7:109` | Sim (`src/app/(abas)/index.tsx`) |
| 05 Registrar consumo | `5:2` | `7:188` | Sim (`src/app/(abas)/registrar.tsx`) |
| 06 Memória de cálculo | `5:83` | `7:269` | Sim (`src/app/(abas)/(inicio)/memoria/[periodo]/[fonte].tsx`) |
| 07 Sugestões de redução | `5:150` | `7:336` | Sim (`src/app/(abas)/(inicio)/sugestoes/[periodo].tsx`) |
| 08 Simular plantio | `6:2` | `7:407` | Sim (`src/app/(abas)/(inicio)/plantio/[periodo].tsx`) |
| 09 Histórico | `6:69` | `7:474` | Não |
| 10 Ajustes | `6:154` | `7:559` | Não |

O protótipo não tem a tela "Uma conta que você pode conferir" das boas-vindas, nem a escolha de estado e bioma do RF13. Telas sem protótipo seguem o modelo das existentes.

## Cores

Todos os valores abaixo vivem em `src/ui/tema` e são a única fonte de cor do app. Componentes nunca usam hexadecimais diretamente.

| Token | Claro (padrão) | Escuro | Uso |
| --- | --- | --- | --- |
| `fundo` | `#F4F6F3` | `#0D1210` | Fundo das telas |
| `superficie` | `#FFFFFF` | `#161D1A` | Cartões, linhas de lista, barra de navegação no claro |
| `borda` | `#DDE4DF` | `#26302C` | Bordas de cartões e divisórias |
| `texto` | `#0D1210` | `#EEF3F0` | Texto principal |
| `textoSuave` | `#55625B` | `#9BA8A1` | Legendas, rótulos, texto secundário |
| `marca` | `#C5F06A` | `#C5F06A` | Preenchimento de botões primários e destaques |
| `sobreMarca` | `#0D1210` | `#0D1210` | Texto e ícones sobre `marca` |
| `marcaForte` | `#3D6B0F` | `#C5F06A` | Texto, ícones e traços em destaque sobre fundo ou superfície |
| `trilhaAnel` | `#E6ECE8` | `#161D1A` | Trilha de fundo do gráfico em anel |
| `grafico1` | `#6AA521` | `#C5F06A` | Maior fonte no anel |
| `grafico2` | `#1F4D3C` | `#6FAF8E` | Segunda fonte |
| `grafico3` | `#9CC4B0` | `#3F6B58` | Terceira fonte |
| `veu` | `rgba(13, 18, 16, 0.4)` | `rgba(0, 0, 0, 0.6)` | Véu escuro atrás de folhas e janelas sobrepostas |

**Por que existem `marca` e `marcaForte`.** O verde-limão tem contraste excelente sobre o fundo escuro, mas some sobre o branco. No tema claro ele só aparece como preenchimento (botões, com texto escuro por cima); texto e ícones em destaque usam `marcaForte`. No escuro os dois tokens têm o mesmo valor.

As três cores do gráfico diferem em luminosidade, não só em tom, para continuarem distinguíveis por quem tem daltonismo. A legenda ao lado do anel sempre mostra os valores em texto.

## Tipografia

| Token | Família | Tamanho | Peso | Altura de linha | Uso |
| --- | --- | --- | --- | --- | --- |
| `numeroControle` | Space Grotesk | 72 | 700 | 1.0 | Número do controle de quantidade (simulação de plantio) |
| `numeroDestaque` | Space Grotesk | 52 | 700 | 1.0 | Total no centro do anel; espaçamento entre letras −1,56 |
| `titulo` | Space Grotesk | 34 | 700 | 1.08 | Títulos das telas de boas-vindas; espaçamento entre letras −0,68 |
| `tituloTela` | Space Grotesk | 24 | 700 | 1.2 | Título de tela interna, como “Registrar consumo” |
| `numeroCartao` | Space Grotesk | 32 | 700 | 1.0 | Números em cartões |
| `numeroResultado` | Space Grotesk | 44 | 700 (−1,32) | 1.0 | Emissão da fonte no topo da memória de cálculo |
| `tituloDetalhe` | Space Grotesk | 20 | 700 | 1.2 | Título de tela de detalhe com seta de voltar; emissão do mês na conta |
| `subtitulo` | Space Grotesk | 18 | 700 | 1.2 | Seletor de período, títulos de seção |
| `numeroLinha` | Space Grotesk | 15 | 700 | 1.3 | Valor na legenda do anel |
| `botao` | Space Grotesk | 17 | 700 | 1.2 | Texto do BotaoPrimario |
| `contador` | Space Grotesk | 14 | 500 | 1.3 | Contador de passos ("01 / 04") |
| `corpo` | IBM Plex Sans | 16 | 400 | 1.5 | Parágrafos |
| `unidadeResultado` | IBM Plex Sans | 18 | 500 | 1.3 | Unidade ao lado de `numeroResultado` |
| `opcao` | IBM Plex Sans | 16 | 600 | 1.3 | Título de opção em cartão |
| `linha` | IBM Plex Sans | 15 | 400 | 1.3 | Nome na legenda do anel |
| `item` | IBM Plex Sans | 15 | 500 | 1.4 | Itens de lista, opção não marcada do seletor segmentado |
| `itemForte` | IBM Plex Sans | 15 | 600 | 1.4 | Botões secundários ("Pular"), opção marcada do seletor segmentado |
| `rotulo` | IBM Plex Sans | 13 | 600 | 1.3 | Rótulo acima de um campo ou seletor |
| `legenda` | IBM Plex Sans | 13 | 400 | 1.4 | Rótulos de cartão, textos auxiliares |
| `apoio` | IBM Plex Sans | 14 | 400 | 1.4 | Participação da fonte e rótulos de linhas de detalhe |
| `apoioForte` | IBM Plex Sans | 14 | 600 | 1.4 | Valores de linhas de detalhe (fonte, ano, versão do fator) |
| `etiqueta` | IBM Plex Sans | 13 | 500 | 1.3 | Texto de pílula (perfil no Início) |
| `nota` | IBM Plex Sans | 12 | 400 | 1.3 | Nota abaixo do número de um cartão |
| `mini` | IBM Plex Sans | 12 | 500 | 1.3 | Rótulos da barra de navegação |
| `miniForte` | IBM Plex Sans | 12 | 600 | 1.3 | Rótulo do item ativo da barra de navegação |

Números com unidade usam Space Grotesk para o valor e IBM Plex Sans para a unidade. Permita o ajuste de tamanho de fonte do sistema; não fixe `allowFontScaling={false}`.

## Espaçamento e forma

- Escala de espaçamento: 4, 8, 12, 16, 20, 24, 32. Margem lateral das telas: 20.
- Raios: 4 (marcadores da legenda), 10 (opções dentro do seletor segmentado), 14 (linhas de lista e trilho do seletor), 16 (cartões e botões), 999 (pílulas e círculos).
- Medidas que aparecem no protótipo fora da escala (10 e 14 entre elementos, 2 entre título e descrição) são arredondadas para o valor mais próximo da escala.
- Cartões: `superficie` com borda de 1 ponto na cor `borda`, sem sombra.
- Áreas de toque com pelo menos 44 × 44 pontos.

## Componentes base

Construa e revise estes antes de qualquer tela:

- **BotaoPrimario:** altura 56, raio 16, fundo `marca`, texto `sobreMarca` em `botao` (Space Grotesk 17/700), largura total. Desativado: fundo `trilhaAnel` e texto `textoSuave`.
- **Campo de consumo:** campo editável com altura 52, raio 14, borda `borda`, valor em Space Grotesk e unidade em `textoSuave`. Acima dele, ícone da fonte, nome em `rotulo` e, à direita, o botão de ajuda: ícone `ajuda` de 20 em `textoSuave`, com área de toque ampliada.
- **FolhaAjuda:** folha inferior aberta pelo botão de ajuda de um campo, com o mesmo véu e os mesmos cantos das folhas de escolha de mês. "Como preencher" em `rotulo` e `marcaForte`, nome do campo em `tituloDetalhe`, resumo em `corpo`, dicas em `linha` e `textoSuave` com ponto de 6 em `marcaForte`, exemplo em bloco `fundo` de raio 14 e botão "Entendi". Rola quando o texto não cabe (fonte grande). A linha acima do título é "Como preencher" por padrão; a simulação de plantio usa "Antes de plantar". Os textos ficam em `src/ui/ajudaConsumo.ts`: dizem onde achar o número e como chegar a ele, sem fatores nem médias de consumo.
- **BotaoTexto:** ação secundária sem fundo, texto `texto` em `itemForte`, área de toque de 44.
- **BotaoSecundario:** ação secundária em destaque ("Ver como reduzir", "Simular plantio"): altura 52, raio 16, `superficie` com `borda`, texto `texto` em `itemForte`.
- **Cartao:** padding 16, raio 16, `superficie` com `borda`.
- **LinhaLista:** altura mínima 56, raio 14, `superficie` com `borda`, ícone de 20 em `marcaForte` e texto em `item`.
- **OpcaoCartao:** escolha única em cartão: ícone de 22 num círculo de 44 com fundo `fundo`, título em `opcao`, descrição em `legenda`, e o marcador de seleção à direita. Marcada: borda de 2 em `marcaForte`.
- **SeletorSegmentado:** trilho `superficie` com `borda`, raio 14 e respiro de 4; opção marcada com fundo `marca` e raio 10.
- **Ilustração:** 200 × 200, desenhos de traço com as mesmas cores do tema; nas boas-vindas fica centralizada no espaço livre acima do título.
- **LinhaLegenda:** marcador quadrado de 10 com raio 3, nome em `linha`, valor em `numeroLinha` alinhado à direita. Com ação (na Início), vira botão com altura mínima de 44 e seta `abrir` em `textoSuave`, e as linhas ficam sem espaço entre si.
- **CabecalhoDetalhe:** seta `voltar` (24, traço 2) com área de toque ampliada e título em `tituloDetalhe`. Usado na memória de cálculo e nas sugestões de redução.
- **GraficoRemocao:** barras horizontais de altura 12 e raio 4 sobre `trilhaAnel`, preenchidas em `grafico1`, uma por marco (5, 10 e 20 anos), numa escala só, com o valor em `numeroLinha` ao lado do rótulo. Uma linha vertical de 2 em `texto` marca a emissão do mês, com legenda própria abaixo das barras. Série única: sem caixa de legenda. Anunciado como imagem, com os valores em texto.
- **SeletorMeses:** folha inferior de escolha de vários meses (simulação de plantio). Atalhos em pílulas no topo (marcado: fundo `marca`, texto `sobreMarca` em `itemForte`; os outros, borda `borda`), grade de 3 × 4 com setas de ano como no `SeletorPeriodo`, meses marcados com fundo `marca` e o ícone `marcado` (✓ de 16, para não depender só da cor), cobertura do ano em `legenda`, total em `itemForte` e `BotaoPrimario` "Simular". Atalhos são `radio`; meses, `checkbox`.
- **SeletorBioma:** folha inferior com os quatro grupos de biomas em `OpcaoCartao`, com a taxa de cada um na descrição.
- **CartaoSugestao:** `Cartao` em linha com ícone de 20 num círculo de 40 com fundo `fundo`, título em `opcao`, descrição em `apoio` e etiqueta de impacto em `miniForte`: "Impacto alto" com fundo `marca` e texto `sobreMarca`; médio e baixo só com borda `borda` e texto `textoSuave`.
- **AnelEmissoes:** área de 210 com anel de 190 de diâmetro externo e 19 de espessura, trilha em `trilhaAnel`, segmentos por fonte da maior para a menor nas cores `grafico1`, `grafico2`, `grafico3`, pontas retas, começando no topo no sentido horário, com 4 pontos de espaço entre segmentos (nenhum quando há uma fonte só) e o total no centro em `numeroDestaque`. Construído com `react-native-svg`; ver "Movimento".
- **BarraNavegacao:** quatro itens (Início, Registrar, Histórico, Ajustes), ícone de 22 e rótulo em `mini`. O ativo tem o ícone em `sobreMarca` sobre uma pílula `marca` de 56 × 32 e o rótulo em `marcaForte` com `miniForte`; só a cor do rótulo era sutil demais. A pílula é uma só e desliza entre as abas (ver "Movimento"). Fundo `superficie` com borda superior; é a barra das abas em `src/app/(abas)/_layout.tsx`.
- **SeletorPeriodo:** folha inferior aberta ao tocar no mês da Início. Fundo `superficie` com cantos superiores de raio 16 sobre o `veu`; título "Escolha o mês" em `subtitulo` e "Fechar"; o ano entre setas (ícones `anterior` e `abrir`, em `borda` quando não há outro ano registrado); grade de 3 × 4 meses abreviados em `item`, raio 10 e altura mínima de 44. Mês com registro: borda `borda` e texto `texto`. Mês escolhido: fundo `marca`, texto `sobreMarca` em `itemForte`. Mês sem registro: texto `textoSuave`, sem borda e desativado. Abre com esmaecimento, ou sem animação se o movimento estiver reduzido. O protótipo não desenha o seletor; este é o padrão até a equipe decidir outro.
- **SeletorMesConsumo:** folha inferior no registro, com a mesma grade e o mesmo tema do `SeletorPeriodo`. Permite o mês atual e meses anteriores a partir de agosto de 2025; meses futuros e anteriores à vigência dos fatores ficam desativados. Meses já registrados são identificados e podem ser editados.
- **CartaoNumero:** `Cartao` com rótulo em `legenda`, número em `numeroCartao` (opcionalmente seguido de unidade em `item`) e nota em `nota`.
- **LinhaAcao:** cartão em linha que leva a outra tela: ícone de 22, título em `itemForte`, descrição em `legenda` e seta em `textoSuave`. Sem destino, aparece desativada.
- **Etiqueta:** pílula `superficie` com `borda` e texto em `etiqueta`.

Ícones: traço de 2 pontos, cantos arredondados, sem preenchimento. Nada de emoji na interface.

Os ícones de sugestão que o protótipo não desenha (bicicleta, folha, velocímetro, ferramenta, gota, termômetro, geladeira, lâmpada, sol, tomada, panela e chama) seguem o desenho do [Lucide](https://lucide.dev) (licença ISC, © Lucide Contributors), a mesma família visual dos ícones do protótipo. São feitos na grade de 24 do Lucide e exibidos com 20 (campo `caixa` em `src/ui/Icone.tsx`), o que dá o mesmo traço visual de 1,67 dos ícones do protótipo.

## Movimento

- O anel se desenha de zero até o valor ao abrir a tela e ao trocar de período: 700 ms, curva de saída suave (`Easing.out(Easing.cubic)`), segmentos em sequência.
- **Como o anel é animado.** Um `Animated.Value` da API `Animated` do React Native vai de 0 a 1; a cada quadro, o comprimento visível de cada segmento é recalculado. Cada segmento é posicionado pelo `strokeDashoffset` negativo, sem girar o círculo, e o anel inteiro gira −90° por um `transform` de estilo para começar no topo. Evite o Reanimated (o `expo-router/testing-library` o troca por um objeto vazio nos testes), o `Animated.createAnimatedComponent` em elementos do `react-native-svg` e as propriedades `rotation`/`origin` neles: os dois geram avisos na versão web.
- O total no centro conta de zero até o valor durante a mesma animação.
- **Pílula da aba ativa.** Ao trocar de aba, a pílula desliza na horizontal até a aba tocada, com mola de rigidez 260 e amortecimento 28 (quase sem repique, como no iOS). É um `Animated.spring` do React Native com `translateX` na thread nativa (`useNativeDriver`, desligado só na web), então roda igual no iOS e no Android. A pílula funciona como lente: dentro dela há uma cópia dos ícones em `sobreMarca` que anda no sentido contrário, de modo que o trecho de ícone sob a pílula fica escuro durante todo o trajeto. O rótulo muda de cor no toque, sem esperar a pílula.
- Transições entre telas: as padrão do Expo Router.
- Com a opção de reduzir movimento ativada no sistema, os elementos aparecem já no estado final. Use o hook `useReduzirMovimento` de `src/ui`, que lê a configuração pelo `AccessibilityInfo` do React Native e, ao contrário do `useReducedMotion` do Reanimated, funciona nos testes do Jest.

## Abertura

Ao abrir o app, o anel das emissões se fecha, um broto cresce no meio e aparece a frase **"Meça. Reduza. Neutralize."**, a proposta do app na ordem em que ele pede para agir. Código em `src/ui/AberturaAnimada.tsx`, montado por `src/app/_layout.tsx`.

- **Duas etapas.** A abertura nativa (plugin `expo-splash-screen` no `app.json`) mostra só a trilha do anel (`trilhaAnel`) sobre `fundo`, com uma versão para o tema escuro do sistema. Quando as fontes carregam, a `AberturaAnimada` desenha um primeiro quadro idêntico a ela, a nativa é escondida e a animação roda por cima do app, que já carrega embaixo. As imagens são `assets/images/splash-icon.png` e `splash-icon-dark.png` (1024 × 1024, fundo transparente, exibidas com 200), geradas do mesmo desenho do anel.
- **Tempos.** O anel se desenha em 700 ms (`Easing.out(Easing.cubic)`), começando no topo no sentido horário; o broto cresce com mola a partir de 350 ms; a frase surge aos 700 ms, em 300 ms. Depois de uma pausa de 350 ms, tudo some em 350 ms. Total: 1,7 s.
- **Movimento reduzido.** Tudo aparece pronto, fica 600 ms na tela e some sem animação.
- **Cores.** Anel em `grafico1` sobre `trilhaAnel`, broto com traço `marcaForte` e folhas `marca`, frase em `subtitulo` e `texto`. A animação segue o tema escolhido no app; a abertura nativa só conhece o tema do sistema, então quem escolheu um tema diferente do sistema vê a troca de fundo no primeiro quadro.
- **Expo Go.** Desde o SDK 52, o Expo Go mostra o ícone do app no lugar da abertura nativa ([documentação do expo-splash-screen](https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/)). A animação aparece normalmente, porque é uma tela do app; a abertura nativa só pode ser conferida num build de prévia ou de produção.
- **Sem biblioteca.** A animação usa a `Animated` do React Native e o `react-native-svg`, já instalados. Lottie funcionaria, mas traria uma dependência e trabalho extra para o tema escuro e o movimento reduzido; o `react-native-bootsplash` não roda no Expo Go.

## Ícone do app

O último quadro da abertura, simplificado para continuar legível a 29 px: um anel `marca` inteiro, sem trilha e sem segmentos, com o broto no meio, sobre fundo `#0D1210` (o `fundo` do tema escuro). O broto é 1,5 vez maior que na abertura, com folhas preenchidas sem contorno (a da esquerda em `grafico1` claro, `#6AA521`, para dar profundidade) e caule grosso. Sem texto, degradê, sombra ou cantos arredondados, que o sistema aplica.

- **Por que fundo escuro.** Sobre o claro, o verde-limão some (contraste de 1,2:1); sobre o escuro, chega a 14,6:1, e o ícone fica igual à abertura no tema escuro.
- **iOS.** `ios.icon` com três PNGs de 1024: `light` é o ícone completo e opaco (`icon.png`, também o ícone geral e o que o Expo Go mostra ao abrir); `dark` e `tinted` têm fundo transparente para o sistema pôr o dele, e o `tinted` é em tons de cinza. O anel ocupa 66% da tela. O pacote `.icon` do Icon Composer ficou de fora: só compila num Mac, e um erro nele só apareceria no build do EAS.
- **Android.** Ícone adaptável com `foregroundImage` transparente, fundo só por `backgroundColor` e `monochromeImage` (silhueta branca, para os ícones temáticos do Android 13). O anel ocupa 59% da tela (64 dp de 108), dentro da zona segura de 66 dp que nenhuma máscara corta.
- **Fontes.** Os SVGs ficam em `assets/icone/`, junto com os da abertura nativa. Depois de mudar um deles, `sh assets/icone/gerar.sh` (precisa do ImageMagick) gera de novo os PNGs de `assets/images/`.
- **Conferir.** No Expo Go, o ícone aparece só por um instante, ao abrir; na tela inicial do celular fica sempre o ícone do Expo Go. O ícone de verdade, com máscaras e variantes, só aparece num build de prévia ou de produção.

## Tema

- Padrão: claro. Opções em Ajustes: Claro, Escuro e Seguir o sistema.
- A escolha fica salva no aparelho e é aplicada antes da primeira tela aparecer, para não piscar o tema errado.
- Verifique toda tela nova nos dois temas antes de concluir.
