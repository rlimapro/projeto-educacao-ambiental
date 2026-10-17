# Design — estilo Carvão

Referência visual: as telas "Carvão" (escuro) e "Carvão claro" no canvas de estilos do projeto. Peça o link a quem mantém o canvas.

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
| `titulo` | Space Grotesk | 34 | 600 | 1.08 | Títulos das telas de boas-vindas |
| `numeroCartao` | Space Grotesk | 32 | 600 | 1.0 | Números em cartões |
| `subtitulo` | Space Grotesk | 18 | 600 | 1.2 | Seletor de período, títulos de seção |
| `corpo` | IBM Plex Sans | 16 | 400 | 1.5 | Parágrafos |
| `item` | IBM Plex Sans | 15 | 500 | 1.4 | Itens de lista, botões secundários |
| `legenda` | IBM Plex Sans | 13 | 400 | 1.4 | Rótulos de cartão, textos auxiliares |
| `mini` | IBM Plex Sans | 12 | 500 | 1.3 | Rótulos da barra de navegação |

Números com unidade usam Space Grotesk para o valor e IBM Plex Sans para a unidade. Permita o ajuste de tamanho de fonte do sistema; não fixe `allowFontScaling={false}`.

## Espaçamento e forma

- Escala de espaçamento: 4, 8, 12, 16, 20, 24, 32. Margem lateral das telas: 20.
- Raios: 4 (marcadores da legenda), 14 (linhas de lista), 16 (cartões e botões), 999 (pílulas).
- Cartões: `superficie` com borda de 1 ponto na cor `borda`, sem sombra.
- Áreas de toque com pelo menos 44 × 44 pontos.

## Componentes base

Construa e revise estes antes de qualquer tela:

- **BotaoPrimario:** altura 56, raio 16, fundo `marca`, texto `sobreMarca` em Space Grotesk 17/600.
- **Cartao:** padding 16, raio 16, `superficie` com `borda`.
- **LinhaLegenda:** marcador quadrado de 10 com raio 3, nome em `item`, valor em Space Grotesk 15/600 alinhado à direita.
- **AnelEmissoes:** anel de diâmetro 210 e espessura 18, segmentos por fonte na ordem `grafico1`, `grafico2`, `grafico3`, com 4 pontos de espaço entre segmentos e o total no centro. Construído com `react-native-svg`.
- **BarraNavegacao:** quatro itens (Início, Registrar, Histórico, Ajustes), ícone e rótulo; o ativo em `marcaForte`.

Ícones: traço de 2 pontos, cantos arredondados, sem preenchimento. Nada de emoji na interface.

## Movimento

- O anel se desenha de zero até o valor ao abrir a tela e ao trocar de período: 700 ms, curva de saída suave, segmentos em sequência.
- O total no centro conta de zero até o valor durante a mesma animação.
- Transições entre telas: as padrão do Expo Router.
- Com a opção de reduzir movimento ativada no sistema, os elementos aparecem já no estado final. Use `useReducedMotion` do Reanimated.

## Tema

- Padrão: claro. Opções em Ajustes: Claro, Escuro e Seguir o sistema.
- A escolha fica salva no aparelho e é aplicada antes da primeira tela aparecer, para não piscar o tema errado.
- Verifique toda tela nova nos dois temas antes de concluir.
