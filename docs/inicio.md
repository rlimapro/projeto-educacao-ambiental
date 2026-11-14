# Tela Início (RF03, RF05, RF07, RF08)

Primeira aba do app. Mostra as emissões do período, de onde elas vêm, quantas árvores as neutralizariam e a comparação com o período anterior, e leva às sugestões de redução. Código em `src/app/(abas)/index.tsx`.

Visual: protótipo no Figma, tela "04 Início" (nós `2:2` claro e `7:109` escuro; ver `docs/design.md`).

## O que a tela mostra

| Parte | Conteúdo | Origem |
| --- | --- | --- |
| Topo | Mês e ano do período (tocar abre o seletor de mês), e o perfil escolhido nas boas-vindas | `src/dados/periodos.ts`, `lerPerfil()` |
| Anel | Total do período e participação de cada fonte, animados | `resumirEmissoes` (RF03) |
| Legenda | Cada fonte com sua emissão, da maior para a menor; tocar abre a memória de cálculo da fonte (RF04, `docs/memoria-calculo.md`) | `resumirEmissoes` |
| Para neutralizar | Árvores que neutralizariam o período em 20 anos, arredondadas para cima | `arvoresParaNeutralizar` (RF05) |
| Comparado a… | Variação percentual e diferença em kg em relação ao período anterior | `compararPeriodos` (RF07) |
| Reduzir antes de compensar | Quantidade de sugestões para o grupo de fontes que mais emitiu; abre as sugestões (`docs/sugestoes-reducao.md`) | `agruparSugestoes` (RF08) |
| Barra de navegação | Início, Registrar, Histórico, Ajustes | `src/app/(abas)/_layout.tsx` |

Depois de "Calcular emissões", o Registrar abre a Início no mês registrado (parâmetro `periodo`, no formato AAAA-MM). O mês escolhido continua o mesmo ao voltar da memória de cálculo.

## Primeiro uso, sem registros

Antes do primeiro registro, a Início mostra o que vai aparecer ali e o caminho até lá. O protótipo não desenha esse estado; ele segue o modelo das boas-vindas.

| Parte | Conteúdo |
| --- | --- |
| Topo | "Suas emissões" e o perfil escolhido nas boas-vindas, como na Início com dados |
| Ilustração | `semRegistros` (`src/ui/Ilustracao.tsx`): o anel de emissões ainda vazio, com uma conta de luz em branco e o "+" de registrar |
| Título e frase | "Nenhum consumo registrado" e "Comece pela conta deste mês para ver suas emissões, fonte por fonte." |
| Botão | "Registrar consumo", que abre a aba Registrar |
| Como funciona | Três passos numerados: registrar o consumo do mês (luz, combustível ou gás), ver as emissões (o total, de onde vem e como foi calculado) e reduzir e simular o plantio. A ordem é a do app: reduzir antes de compensar (princípio 3 do `AGENTS.md`) |
| Privacidade | "Seus registros ficam só neste aparelho.", a promessa das boas-vindas |

Para leitores de tela, cada passo é anunciado inteiro ("Passo 1 de 3: Registre o consumo do mês. A conta de luz, o combustível ou o gás de cozinha."), e a ilustração fica escondida, porque o título já diz o que ela mostra.

## Seletor de mês

Tocar no mês abre uma folha com os 12 meses do ano em grade e setas para trocar de ano (`src/ui/SeletorPeriodo.tsx`). Só os meses com consumo registrado podem ser escolhidos; os outros aparecem apagados. Assim qualquer mês fica a um toque, ou dois se for de outro ano, em vez de passar por todos os meses no meio. O protótipo mostra só o mês com a seta para baixo, sem desenhar o seletor.

## Provisório

- **Dados de exemplo.** Os períodos vêm de `src/dados/periodos.ts`, fixos no código, com os totais do protótipo (outubro 245 kg; setembro 278; agosto 302; julho 280). Saem quando o registro de consumos (RF02) gravar no SQLite.
- **Taxa de árvores.** Usa a menor taxa da metodologia (3,037 kg de CO₂ por árvore por ano), a que vale enquanto o usuário não escolhe o estado (RF13).
- **Ajustes** mostra "Em breve". O Histórico está em `docs/historico.md`.

## Divergências do protótipo

| Protótipo | App | Motivo |
| --- | --- | --- |
| "2 árvores" | "5 árvores" | O protótipo usava um valor provisório. 245 kg ÷ (3,037 kg × 20 anos) = 4,03, arredondado para cima. |
| Espaços de 18, 10 e 6 entre elementos | 16, 12 e 4 | Escala de espaçamento do `docs/design.md`. |
| Aba ativa só com ícone e rótulo em `marcaForte` | Ícone sobre pílula `marca` | O destaque só pela cor era sutil demais no aparelho. |
| Legenda sem seta, linhas a 8 pontos uma da outra | Seta à direita, linhas de 44 pontos | A legenda abre a memória de cálculo: a seta mostra que dá para tocar e a altura é a área de toque mínima. |

## Acessibilidade

- O anel é anunciado como imagem, com os valores em texto: "Emissões de outubro de 2026: 245 kg de CO₂e. Combustível 81%, Gás de cozinha 16%, Energia elétrica 4%."
- O total no centro cresce com a fonte do sistema até 1,2 vez, para não sair do anel; o resto da tela cresce sem limite.
- Com a redução de movimento ativada, o anel e o total aparecem já no valor final.
