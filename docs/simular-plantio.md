# Tela Simular plantio (RF05, RF06)

Mostra quanto CO₂ um plantio de árvores nativas poderia retirar da atmosfera ao longo de 20 anos, comparado com a emissão do mês. É uma estimativa educativa, não uma compensação: plantar árvores por conta própria não permite declarar neutralidade de carbono (ISO 14068-1). Código em `src/app/(abas)/(inicio)/plantio/[periodo].tsx`; cálculo em `src/calculo/arvores.ts`.

Visual: protótipo no Figma, tela "08 Simular plantio" (nós `6:2` claro e `7:407` escuro; ver `docs/design.md`).

## Como se chega a ela

Só pelas sugestões de redução: no fim da tela, "Já reduziu o que dava?" e o botão "Simular plantio". Assim o plantio sempre vem depois de reduzir (princípio 3 do `AGENTS.md`). A simulação abre no mês que estava aberto na Início.

## O que a tela mostra

| Parte | Conteúdo | Origem |
| --- | --- | --- |
| Período | Mês ou meses simulados e a emissão somada; abre uma folha com atalhos (só o mês aberto, todo o ano dele quando há mais de um ano, todos os meses) e a grade de meses com marcação múltipla. Some quando só há um mês registrado | `somarEmissoesKgCo2e` |
| Bioma | Onde as mudas seriam plantadas; abre uma folha com os quatro grupos de biomas e a taxa de cada um. Começa no mais lento (Pampa e Mata Atlântica do Sul) | `TAXAS_SEQUESTRO_POR_BIOMA` |
| Para neutralizar | Árvores que neutralizariam o mês nesse bioma, arredondadas para cima. Tocar usa essa quantidade na simulação | `arvoresParaNeutralizar` (RF05) |
| Quantidade | Controle de − e +, de 1 a 9.999 árvores. Começa na quantidade para neutralizar, e volta a ela quando o período muda. Abaixo, a área que as mudas ocupariam num plantio de restauração | `areaPlantioM2` |
| Resultado | Remoção em 20 anos menos a emissão do mês: "+505 kg CO₂e seriam retirados além do que você emitiu" ou "−36 kg CO₂e ainda faltariam" | `sequestroLiquidoKgCo2` (RF06) |
| Ao longo do tempo | Ano em que a remoção alcança a emissão e barras com o acumulado em 5, 10 e 20 anos, com uma linha na emissão do mês | `remocaoAcumuladaKgCo2`, `anoEmQueAlcancaEmissao` |
| Antes de plantar | "Que árvores plantar" e "Como cuidar do plantio", em folhas de ajuda | `src/ui/ajudaPlantio.ts` |

## Por que as árvores não têm taxas diferentes

O protótipo trata todas as árvores como iguais, e a equipe quis saber se dava para diferenciá-las. Três frentes de pesquisa (carbono florestal, contexto de plantio e normas, e calculadoras de referência) concluíram que não há base para isso: nenhuma fonte de referência dá taxa por tipo de árvore, os estudos brasileiros se contradizem, e no único experimento controlado a proporção de pioneiras não mudou o carbono. O que muda o resultado é o bioma e o cuidado com o plantio. Detalhes e fontes em `docs/metodologia-calculo.md`, "Por que a taxa não muda com o tipo de árvore".

Por isso:

- **O bioma muda o número;** o tipo de árvore, não. "Que árvores plantar" explica o papel de pioneiras e não pioneiras, pede espécies nativas e variadas e desaconselha eucalipto e pinus.
- **A variação e a sobrevivência das mudas ficam fora da tela.** A primeira versão tinha um cartão "Premissas" com a taxa, o horizonte, a fonte, a variação do bioma ("cerca de X% acima ou abaixo") e o cuidado que a estimativa supõe. A equipe o tirou por ser técnico demais para a tela; os valores continuam documentados na metodologia, e o cuidado com as mudas aparece em "Como cuidar do plantio".
- **O tempo aparece explicitamente:** a emissão do mês já está no ar, e a remoção leva anos.

A forma da variação e da premissa de sobrevivência foi decidida numa discussão entre dois especialistas (carbono florestal e restauração), em duas rodadas. Os dois concordaram em não mostrar taxa de sobrevivência e em dizer que, sem cuidado, o resultado tende a ficar abaixo; a porcentagem por bioma foi escolhida por ser rastreável a uma célula da tabela do IPCC.

## Vários meses

A escolha de meses foi decidida com dois especialistas em neutralização (carbono florestal e restauração) e um de usabilidade móvel:

- **Atalhos e grade.** Os atalhos cobrem quase todos os casos (o mês, o ano, tudo); a grade permite escolher meses avulsos. A folha confirma com "Simular": com várias marcações, aplicar a cada toque mudaria a tela por trás sem que o usuário visse. Fechar sem confirmar descarta a escolha. Sem nenhum mês marcado, "Simular" fica desativado.
- **Um plantio só, sem estimar meses.** As árvores são arredondadas uma vez, sobre a soma; meses sem registro não entram; o plantio é único e feito agora. Detalhes em `docs/metodologia-calculo.md`, "Vários meses num plantio só".
- **Textos.** As frases da tela trocam "outubro" por "esses 5 meses" ou "todos os meses registrados", e o gráfico chama a linha de "Emitido no período".
- **Área.** "Em plantio de restauração (3 m × 2 m), ocupariam cerca de X m²", com o aviso de que árvores isoladas ocupam mais espaço.

## Estados

- Mês sem registro, ou com emissão zero: "Nenhuma emissão neste mês".
- Erro ao ler os dados: mensagem sem alterar nada.

## Provisório

- **Bioma.** A escolha vale só para a simulação aberta. Quando existir a escolha de estado (RF13), o bioma virá dela, salvo no aparelho.

## Divergências do protótipo

| Protótipo | App | Motivo |
| --- | --- | --- |
| Taxa "[A DEFINIR]" | Taxa do bioma escolhido, com fonte | Valores da metodologia (IPCC 2019). |
| Sem escolha de bioma | Linha com o bioma, que abre a escolha | A taxa varia mais de duas vezes entre biomas. |
| "retirados da atmosfera" | "seriam retirados" | É uma estimativa do futuro, não algo que já aconteceu. |
| Resultado sempre positivo, em verde | Negativo em cartão neutro: "ainda faltariam" | Com poucas árvores, a remoção não alcança a emissão. |
| Sem tempo | "Ao longo do tempo", com 5, 10 e 20 anos | A remoção leva anos; a emissão já aconteceu. |
| Cartão de premissas (taxa e horizonte) | Sem cartão de premissas | Técnico demais para a tela. A taxa do bioma aparece na escolha de bioma; a metodologia guarda os detalhes. |
| Raio 20 no cartão do resultado | 16 | Escala de raios do `docs/design.md`. |
| Espaços de 28 e 6 | 24 e 4 | Escala de espaçamento. |

## Acessibilidade

- Os botões − e + têm rótulos ("Uma árvore a menos/a mais") e ficam desativados nos limites; a quantidade é anunciada quando muda.
- O gráfico é anunciado como imagem, com todos os valores em texto.
