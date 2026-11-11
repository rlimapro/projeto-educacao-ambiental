# Tela Sugestões de redução (RF08)

Mostra como diminuir as emissões do mês, começando pelo que mais emite, antes de qualquer conversa sobre compensação. Código em `src/app/(abas)/(inicio)/sugestoes/[periodo].tsx`; catálogo e regras em `src/calculo/sugestoes.ts`.

Visual: protótipo no Figma, tela "07 Sugestões de redução" (nós `5:150` claro e `7:336` escuro; ver `docs/design.md`).

## Como se chega a ela

- **Pela Início:** o atalho "Reduzir antes de compensar" ("7 sugestões para combustível") abre a tela no grupo que mais emitiu no mês aberto.
- **Pela memória de cálculo:** "Ver como reduzir" abre a tela já no grupo daquela fonte.

A tela fica na pilha da aba Início, com a barra de abas visível, como no protótipo.

## Como as sugestões são escolhidas

Tudo roda no aparelho, a partir do cálculo salvo no registro do mês (`agruparSugestoes`):

1. **Grupos de fontes.** As cinco fontes viram três grupos, como o usuário as enxerga: combustível (gasolina, etanol e diesel), energia elétrica e gás de cozinha.
2. **Ordem.** Os grupos vão do que mais emitiu para o que menos emitiu. Grupos sem emissão no mês ficam de fora. A tela abre no primeiro, e botões no topo trocam de grupo quando há mais de um.
3. **Perfil.** Cada sugestão vale para alguns perfis. "Divida o carro" e "Encurte o banho" são para pessoa e residência; "Planeje entregas por região" e "Desligue tudo ao fechar", para comércio. O perfil usado é o do registro do mês.
4. **Fonte presente.** Algumas sugestões só fazem sentido se uma fonte tiver emissão: "Prefira etanol no carro flex" só aparece com gasolina no mês.
5. **Impacto.** Dentro do grupo, as sugestões vão da de maior impacto para a de menor. Entre as de mesmo impacto, vale a ordem do catálogo.

A tela mostra as três primeiras e um botão "Mostrar mais" com as outras.

## Quanto vale reduzir

Abaixo da frase do grupo, a tela diz quanto 10% a menos de consumo evitaria por mês ("Cada 10% a menos evita 14 kg de CO₂e por mês"). É o único número da tela, e vem do próprio cálculo do mês: a emissão do grupo × 0,10 (ver "Sugestões de redução" em `docs/metodologia-calculo.md`). Abaixo de 1 kg, aparece "menos de 1 kg".

## Impacto das sugestões

O impacto é qualitativo e compara as sugestões de um mesmo grupo. Não é uma estimativa de kg evitados: o app não tem dados por aparelho ou por veículo do usuário para isso.

| Impacto | Critério |
| --- | --- |
| Alto | Corta diretamente uma parte grande do consumo da fonte, ou troca por uma opção que emite bem menos pelos fatores do app (como o etanol) |
| Médio | Melhora a eficiência do uso: o mesmo resultado com menos consumo |
| Baixo | Ganho pequeno ou pontual, mas fácil de fazer |

**Para revisão da equipe:** o catálogo (`SUGESTOES_REDUCAO`) tem 20 sugestões, todas de orientação geral e sem números. Vale a revisão de alguém da disciplina antes da entrega, principalmente a classificação de impacto e o texto do etanol, que se apoia nos fatores da metodologia (gasolina 1,5738 kg CO₂e/L contra etanol 0,0436 kg CO₂e/L) e não leva em conta que o carro roda menos quilômetros por litro de etanol.

## Estados

- Sem registro no mês, ou com emissão zero: "Nenhuma emissão neste mês".
- Erro ao ler os dados: mensagem sem alterar nada.

## Provisório

- **"Simular plantio"** não aparece: a tela de simulação (RF06) ainda não existe. Quando existir, entra no fim da tela com "Já reduziu o que dava?", como no protótipo, depois das sugestões.

## Divergências do protótipo

| Protótipo | App | Motivo |
| --- | --- | --- |
| Só o grupo que mais emite | Botões no topo para trocar de grupo, abrindo no que mais emite | Quem quer agir numa fonte menor também recebe sugestões. |
| Sem número | "Cada 10% a menos evita X kg de CO₂e por mês" | Mostra o que está em jogo com um número derivado do próprio cálculo do mês. |
| Três sugestões fixas | Três primeiras e "Mostrar mais" | O catálogo tem de 5 a 8 sugestões por grupo e perfil. |
| Terceira sugestão "Calibre os pneus" | "Prefira etanol no carro flex" (impacto alto) vem antes | As sugestões seguem a ordem de impacto. |
| Espaços de 14 e 6 | 12 e 4 | Escala de espaçamento do `docs/design.md`. |

## Acessibilidade

- O título é cabeçalho, e os botões de grupo são um grupo de opções (`radiogroup`), com o grupo atual marcado.
- O atalho da Início lê título e quantidade: "Reduzir antes de compensar. 7 sugestões para combustível".
