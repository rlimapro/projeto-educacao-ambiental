# Tela Início (RF03, RF05, RF07, RF08)

Primeira aba do app. Mostra as emissões do período, de onde elas vêm, quantas árvores as neutralizariam e a comparação com o período anterior, e leva às sugestões de redução. Código em `src/app/(abas)/index.tsx`.

Visual: protótipo no Figma, tela "04 Início" (nós `2:2` claro e `7:109` escuro; ver `docs/design.md`).

## O que a tela mostra

| Parte | Conteúdo | Origem |
| --- | --- | --- |
| Topo | Mês e ano do período (tocar abre o seletor de mês), e o perfil escolhido nas boas-vindas | `src/dados/periodos.ts`, `lerPerfil()` |
| Anel | Total do período e participação de cada fonte, animados | `resumirEmissoes` (RF03) |
| Legenda | Cada fonte com sua emissão, da maior para a menor | `resumirEmissoes` |
| Para neutralizar | Árvores que neutralizariam o período em 20 anos, arredondadas para cima | `arvoresParaNeutralizar` (RF05) |
| Comparado a… | Variação percentual e diferença em kg em relação ao período anterior | `compararPeriodos` (RF07) |
| Reduzir antes de compensar | Quantidade de sugestões para a maior fonte | RF08 |
| Barra de navegação | Início, Registrar, Histórico, Ajustes | `src/app/(abas)/_layout.tsx` |

Sem nenhum período registrado, a tela mostra um cartão explicando o que fazer, com o botão "Registrar consumo".

## Seletor de mês

Tocar no mês abre uma folha com os 12 meses do ano em grade e setas para trocar de ano (`src/ui/SeletorPeriodo.tsx`). Só os meses com consumo registrado podem ser escolhidos; os outros aparecem apagados. Assim qualquer mês fica a um toque, ou dois se for de outro ano, em vez de passar por todos os meses no meio. O protótipo mostra só o mês com a seta para baixo, sem desenhar o seletor.

## Provisório

- **Dados de exemplo.** Os períodos vêm de `src/dados/periodos.ts`, fixos no código, com os totais do protótipo (outubro 245 kg; setembro 278; agosto 302; julho 280). Saem quando o registro de consumos (RF02) gravar no SQLite.
- **Taxa de árvores.** Usa a menor taxa da metodologia (3,037 kg de CO₂ por árvore por ano), a que vale enquanto o usuário não escolhe o estado (RF13).
- **"Reduzir antes de compensar"** aparece desativado: a tela de sugestões (RF08) ainda não existe.
- **Registrar, Histórico e Ajustes** mostram "Em breve".

## Divergências do protótipo

| Protótipo | App | Motivo |
| --- | --- | --- |
| "2 árvores" | "5 árvores" | O protótipo usava um valor provisório. 245 kg ÷ (3,037 kg × 20 anos) = 4,03, arredondado para cima. |
| Espaços de 18, 10 e 6 entre elementos | 16, 12 e 4 | Escala de espaçamento do `docs/design.md`. |
| Aba ativa só com ícone e rótulo em `marcaForte` | Ícone sobre pílula `marca` | O destaque só pela cor era sutil demais no aparelho. |

## Acessibilidade

- O anel é anunciado como imagem, com os valores em texto: "Emissões de outubro de 2026: 245 kg de CO₂e. Combustível 81%, Gás de cozinha 16%, Energia elétrica 4%."
- O total no centro cresce com a fonte do sistema até 1,2 vez, para não sair do anel; o resto da tela cresce sem limite.
- Com a redução de movimento ativada, o anel e o total aparecem já no valor final.
