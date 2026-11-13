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

## Distribuir no terreno

Abaixo da área do plantio, "Ver como caberiam no terreno" abre `src/app/(abas)/(inicio)/distribuir.tsx` com a quantidade de árvores simulada. É um planejador em 2D, como a colocação de construções em jogos de estratégia:

- **Terreno.** Largura e comprimento em metros, de 2 a 100. Começa no menor quadrado, a partir de 6 m, em que cabem todas as mudas, com folga.
- **Espaço de cada muda.** Um retângulo de 3 m × 2 m numa grade de 1 m: o mesmo espaçamento do plantio de mata da taxa por muda, então o planejador e a área da simulação (árvores × 6 m²) sempre batem.
- **Colocar e mover.** Tocar no terreno põe a próxima muda, centrada no toque; arrastar uma muda a leva para outra casa. Durante o arraste, o espaço fica vermelho onde encosta no de outra muda ou sai do terreno, e soltar ali devolve a muda ao lugar de antes. Encostar pela borda é permitido.
- **Atalhos.** "Distribuir automaticamente" preenche em fileiras; tocar numa muda a seleciona para "Tirar a muda"; "Limpar terreno" tira todas e só aparece quando o terreno tem alguma muda. Diminuir o terreno tira as mudas que deixam de caber, com aviso. Segurar e arrastar uma muda é sempre para movê-la.
- **Tirar um terreno.** Arrastar e soltar numa lixeira, como nas telas iniciais de celular: tocar e segurar um terreno (500 ms) o pega, e uma lixeira surge no pé da tela, com "Arraste até a lixeira para tirar". A cópia do terreno segue o dedo; sobre a lixeira (com 16 pontos de folga), ela cresce e fica em `perigo`, e o aviso muda para "Solte para tirar o terreno N". Soltar fora dela não tira nada. Mexer o dedo antes dos 500 ms deixa a lista de terrenos rolar para os lados, e um toque curto abre o terreno. Com um terreno só, segurar não pega nada: para esvaziá-lo, há "Limpar terreno". Tirado o terreno, a lista diz "O terreno N saiu do plano, com X mudas" e oferece "Desfazer (5 s)", que o devolve ao mesmo lugar (com as mudas que ainda faltarem no plano). O botão conta os segundos e, ao chegar a zero, some com o aviso; também some no aviso seguinte. Com leitor de tela ligado, não há prazo nem contagem: 5 segundos não bastam para chegar ao botão (WCAG 2.2.1, tempo ajustável), e ele fica até o próximo aviso. O leitor é detectado por `src/ui/useLeitorDeTela.ts`. Componentes `src/ui/OpcaoTerreno.tsx` e `src/ui/CamadaLixeira.tsx`, sem biblioteca nova: o gesto usa os eventos de toque do React Native, como o arraste das mudas.
- **Por que não "segurar para selecionar".** Uma versão anterior abria um modo de seleção (como nas galerias de fotos) ao segurar uma muda ou um terreno, com "Selecionar todas" e "Tirar". Ela foi desfeita: segurar e arrastar uma muda já é o gesto de movê-la, e os dois se confundiam.
- **Rolagem.** Enquanto houver um dedo no terreno, a tela não rola: tocar, arrastar uma muda, andar com zoom ou fazer a pinça mexem só no terreno. Enquanto um terreno é arrastado até a lixeira, nem a tela nem a lista de terrenos rolam. A trava vale do primeiro dedo que encosta até o último sair (eventos de toque da janela do terreno), e o terreno também impede a rolagem nativa de tomar o gesto. Para rolar a tela, arraste fora do terreno.
- **Capacidade.** A tela diz quantas mudas cabem (⌊largura ÷ 3⌋ × ⌊comprimento ÷ 2⌋) e avisa quando o terreno não comporta todas.
- **Vários terrenos.** "+ Terreno" acrescenta outro terreno, com medidas próprias, até 100 (com o terreno máximo, 7 já comportam as 9.999 mudas da simulação; o limite folgado serve a quem divide o plantio em muitos terrenos pequenos). As mudas da simulação são divididas entre eles: 10 árvores podem ficar 4 num terreno de 6 × 4 m, 3 num de 3 × 6 m e 3 num terceiro. O terreno novo começa no tamanho sugerido para as mudas que faltam. "Distribuir automaticamente" preenche o terreno aberto com as mudas que não estão nos outros; a numeração continua de um terreno para o outro. O topo mostra o total ("7 de 10 mudas em 3 terrenos · cabem até 18") e, abaixo das medidas, o terreno aberto.
- **Plano salvo.** Terrenos e mudas ficam salvos no aparelho a cada mudança (`src/dados/planoTerrenos.ts`, chave `plantio.terrenos.v1`), e a tela os retoma ao abrir. Se a simulação agora tem menos árvores, as últimas mudas colocadas saem do plano, do último terreno para o primeiro, com aviso. Um plano salvo inválido (lado fora de 2 a 100 m, muda fora do terreno ou sobreposta, ids repetidos, mais de 100 terrenos) é descartado e a tela começa do zero: ele não guarda consumos, e refazê-lo é simples.
- **Zoom.** Num terreno grande as mudas ficam minúsculas. A pinça de dois dedos aproxima e afasta mantendo sob os dedos o ponto em que ela começou, e os botões − e + fazem o mesmo em passos de 1,5×, em torno do centro; "Ver inteiro" volta ao terreno todo. Com zoom, arrastar o fundo anda pelo terreno, sem deixar faixa vazia nas bordas, e tocar sem arrastar continua pondo uma muda. Os botões só aparecem quando dá para aproximar pelo menos 1,5× (o zoom máximo é de 32 pontos por metro), e mudar de terreno ou de medidas volta ao terreno inteiro. Com zoom, só são desenhadas as mudas na vista e numa margem de uma janela em volta (`mudaNaVista`): o terreno cheio mostra algumas dezenas por vez, e não 1.650. A vista é escolhida de novo ao soltar o dedo e no meio de um arraste longo, quando ela anda meia janela; a muda selecionada e a arrastada ficam sempre desenhadas. Durante o arraste e a pinça, só o transform do terreno muda (Animated do React Native, sem Reanimated); o novo zoom é desenhado ao soltar, para não redesenhar até 1.650 mudas a cada quadro. A geometria está em `src/ui/geometriaTerreno.ts`, testada sem a tela.
- **Visual.** O terreno é terra arada vista de cima (sulcos ondulados, torrões, pedrinhas, palha e manchas de terra úmida e seca), e cada muda tem uma copa vista de cima. Detalhes em `docs/design.md`.
- **Valores irreais.** A quantidade vinda do link vira um inteiro de 1 a 9.999 ("abc" e "-5" viram 1; "1e9", 9.999). Os campos do terreno só aceitam dígitos; um lado fora de 2 a 100 m não muda o terreno, deixa o campo vermelho com o aviso da faixa e volta ao último valor válido ao sair do campo. No terreno máximo (100 × 100 m) cabem 1.650 mudas; a copa é um círculo simples nesse tamanho (o desenho vista de cima só aparece a partir de 10 pontos), para esse caso não pesar no celular, e o aviso sugere adicionar outro terreno em vez de aumentar o que já está no máximo.

As regras são funções puras em `src/calculo/distribuicao.ts`, testadas sem a tela. O arraste usa os eventos de toque do próprio React Native (sistema de responder), sem biblioteca nova: as bibliotecas de arrastar e soltar avaliadas só reordenam listas ou soltam itens em zonas, sem colisão entre itens numa grade, e todas dependem do Reanimated, que o projeto evita.

Para leitores de tela, o terreno é anunciado com a quantidade de mudas, cada muda com a posição em metros, e "Distribuir automaticamente" faz o trabalho sem arrastar. Tocar duas vezes no terreno põe a próxima muda no primeiro lugar livre, linha por linha; cada terreno tem a ação "Tirar o terreno N", que faz o mesmo que a lixeira sem arrastar; os campos de medida dizem de qual terreno são, e os botões de zoom têm rótulo ("Aproximar", "Afastar").

**A fazer quando existirem:** o backup (RF09 e RF10) e "Apagar todos os meus dados" precisam incluir o plano de terrenos.

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
