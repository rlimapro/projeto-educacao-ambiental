# Design — estilo Carvão

Referência visual: o protótipo de alta fidelidade no Figma ([App de Emissões](https://www.figma.com/design/HlJaNtDhNHMXjLkzh4tK47/App-de-Emiss%C3%B5es)), com as telas nos temas claro e escuro. Quando o protótipo e este documento divergirem, a equipe decide e este documento é atualizado. O arquivo não usa variáveis do Figma; as cores dele são exatamente os tokens abaixo.

O estilo combina tipografia geométrica para números, um verde-limão como marca e superfícies discretas. O tema claro é o padrão; o escuro é opcional.

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

**Por que existem `marca` e `marcaForte`.** O verde-limão tem contraste excelente sobre o fundo escuro, mas some sobre o branco. No tema claro ele só aparece como preenchimento (botões, com texto escuro por cima); texto e ícones em destaque usam `marcaForte`. No escuro os dois tokens têm o mesmo valor.

As três cores do gráfico diferem em luminosidade, não só em tom, para continuarem distinguíveis por quem tem daltonismo. A legenda ao lado do anel sempre mostra os valores em texto.

## Tipografia

| Token | Família | Tamanho | Peso | Altura de linha | Uso |
| --- | --- | --- | --- | --- | --- |
| `numeroDestaque` | Space Grotesk | 52 | 600 | 1.0 | Total no centro do anel |
| `titulo` | Space Grotesk | 34 | 700 | 1.08 | Títulos das telas de boas-vindas; espaçamento entre letras −0,68 |
| `numeroCartao` | Space Grotesk | 32 | 600 | 1.0 | Números em cartões |
| `subtitulo` | Space Grotesk | 18 | 600 | 1.2 | Seletor de período, títulos de seção |
| `botao` | Space Grotesk | 17 | 700 | 1.2 | Texto do BotaoPrimario |
| `contador` | Space Grotesk | 14 | 500 | 1.3 | Contador de passos ("01 / 04") |
| `corpo` | IBM Plex Sans | 16 | 400 | 1.5 | Parágrafos |
| `opcao` | IBM Plex Sans | 16 | 600 | 1.3 | Título de opção em cartão |
| `item` | IBM Plex Sans | 15 | 500 | 1.4 | Itens de lista, opção não marcada do seletor segmentado |
| `itemForte` | IBM Plex Sans | 15 | 600 | 1.4 | Botões secundários ("Pular"), opção marcada do seletor segmentado |
| `rotulo` | IBM Plex Sans | 13 | 600 | 1.3 | Rótulo acima de um campo ou seletor |
| `legenda` | IBM Plex Sans | 13 | 400 | 1.4 | Rótulos de cartão, textos auxiliares |
| `mini` | IBM Plex Sans | 12 | 500 | 1.3 | Rótulos da barra de navegação |

Números com unidade usam Space Grotesk para o valor e IBM Plex Sans para a unidade. Permita o ajuste de tamanho de fonte do sistema; não fixe `allowFontScaling={false}`.

## Espaçamento e forma

- Escala de espaçamento: 4, 8, 12, 16, 20, 24, 32. Margem lateral das telas: 20.
- Raios: 4 (marcadores da legenda), 10 (opções dentro do seletor segmentado), 14 (linhas de lista e trilho do seletor), 16 (cartões e botões), 999 (pílulas e círculos).
- Medidas que aparecem no protótipo fora da escala (10 e 14 entre elementos, 2 entre título e descrição) são arredondadas para o valor mais próximo da escala.
- Cartões: `superficie` com borda de 1 ponto na cor `borda`, sem sombra.
- Áreas de toque com pelo menos 44 × 44 pontos.

## Componentes base

Construa e revise estes antes de qualquer tela:

- **BotaoPrimario:** altura 56, raio 16, fundo `marca`, texto `sobreMarca` em `botao` (Space Grotesk 17/700), largura total.
- **BotaoTexto:** ação secundária sem fundo, texto `texto` em `itemForte`, área de toque de 44.
- **Cartao:** padding 16, raio 16, `superficie` com `borda`.
- **LinhaLista:** altura mínima 56, raio 14, `superficie` com `borda`, ícone de 20 em `marcaForte` e texto em `item`.
- **OpcaoCartao:** escolha única em cartão: ícone de 22 num círculo de 44 com fundo `fundo`, título em `opcao`, descrição em `legenda`, e o marcador de seleção à direita. Marcada: borda de 2 em `marcaForte`.
- **SeletorSegmentado:** trilho `superficie` com `borda`, raio 14 e respiro de 4; opção marcada com fundo `marca` e raio 10.
- **Ilustração:** 200 × 200, desenhos de traço com as mesmas cores do tema; nas boas-vindas fica centralizada no espaço livre acima do título.
- **LinhaLegenda:** marcador quadrado de 10 com raio 3, nome em `item`, valor em Space Grotesk 15/600 alinhado à direita.
- **AnelEmissoes:** anel de diâmetro 210 e espessura 18, segmentos por fonte na ordem `grafico1`, `grafico2`, `grafico3`, com 4 pontos de espaço entre segmentos e o total no centro. Construído com `react-native-svg`.
- **BarraNavegacao:** quatro itens (Início, Registrar, Histórico, Ajustes), ícone e rótulo; o ativo em `marcaForte`.

Ícones: traço de 2 pontos, cantos arredondados, sem preenchimento. Nada de emoji na interface.

## Movimento

- O anel se desenha de zero até o valor ao abrir a tela e ao trocar de período: 700 ms, curva de saída suave, segmentos em sequência.
- O total no centro conta de zero até o valor durante a mesma animação.
- Transições entre telas: as padrão do Expo Router.
- Com a opção de reduzir movimento ativada no sistema, os elementos aparecem já no estado final. Use o hook `useReduzirMovimento` de `src/ui`, que lê a configuração pelo `AccessibilityInfo` do React Native e, ao contrário do `useReducedMotion` do Reanimated, funciona nos testes do Jest.

## Tema

- Padrão: claro. Opções em Ajustes: Claro, Escuro e Seguir o sistema.
- A escolha fica salva no aparelho e é aplicada antes da primeira tela aparecer, para não piscar o tema errado.
- Verifique toda tela nova nos dois temas antes de concluir.
