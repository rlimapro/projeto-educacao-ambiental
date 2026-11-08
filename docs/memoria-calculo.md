# Tela Memória de cálculo (RF04)

Mostra como a emissão de uma fonte num mês foi obtida: o consumo informado, o fator aplicado, o resultado e de onde vem o fator. Código em `src/app/(abas)/(inicio)/memoria/[periodo]/[fonte].tsx`.

Visual: protótipo no Figma, tela "06 Memória de cálculo" (nós `5:83` claro e `7:269` escuro; ver `docs/design.md`).

## Como se chega a ela

Pela legenda do anel na Início: cada fonte é um botão que abre a memória daquela fonte no mês aberto. A tela fica na pilha da aba Início (`src/app/(abas)/(inicio)/_layout.tsx`), então a barra de abas continua visível, com a Início ativa, como no protótipo. A seta de voltar retorna à Início no mesmo mês.

Fluxo completo: Registrar → "Calcular emissões" → Início no mês registrado → toque numa fonte → Memória de cálculo.

Antes, o Registrar mostrava um cartão "Emissões calculadas" com esse mesmo conteúdo, logo abaixo do formulário. O cartão saiu: o Registrar ficou só com o formulário, e a explicação do número passou para esta tela.

## O que a tela mostra

| Parte | Conteúdo | Origem |
| --- | --- | --- |
| Cabeçalho | Seta de voltar e o nome da fonte | Registro salvo |
| Resultado | Emissão da fonte e quanto ela representa do total do mês ("75% das emissões de outubro"); o ano aparece só se não for o atual | `resumirEmissoes` |
| Como chegamos a esse número | Consumo informado × fator de emissão = emissão do mês. No gás de cozinha, uma linha mostra a conversão de botijões em quilos (botijões × 13 kg) antes do fator | `MemoriaCalculoFonte` do registro |
| De onde vem o fator | Fonte bibliográfica, ano de referência e versão do fator usada naquele mês | `FatorEmissao` do registro |

Tudo vem do cálculo guardado no registro (`src/dados/consumos.ts`), e não de uma conta refeita na abertura: se um fator ganhar uma versão nova, o mês já registrado continua mostrando a versão com que foi calculado (RNF04). Os textos em linguagem simples ("90 litros de gasolina", "kg CO₂e por litro") vêm de `descreverConsumo` e `descreverUnidadeFator`, em `src/ui/formatacao.ts`.

Se o mês ou a fonte não existirem mais (registro substituído, por exemplo), a tela explica isso em vez do cálculo. Se os dados salvos não puderem ser lidos, mostra uma mensagem de erro sem alterar nada.

## Provisório

- **"Ver como reduzir"** não aparece: a tela de sugestões (RF08) ainda não existe. A Início faz o mesmo com o atalho "Reduzir antes de compensar". Quando a RF08 existir, o botão entra no fim da tela, como no protótipo.

## Divergências do protótipo

| Protótipo | App | Motivo |
| --- | --- | --- |
| Fonte "Combustível", com a gasolina | Uma memória por combustível (gasolina, etanol, diesel) | Cada combustível tem o seu fator; a conta de uma fonte só tem um fator. |
| Fonte do fator resumida ("IPCC 2006, BEN 2025 e IPCC AR6") | Texto completo do fator, quebrando linha quando é longo | É o texto registrado com o fator; resumir criaria uma segunda versão da referência. |
| Espaços de 14, 10 e 2 | 16, 12 e 4 | Escala de espaçamento do `docs/design.md`. |
| Sem passo de conversão | Linha "2 × 13 kg = 26 kg" no gás de cozinha | O consumo é informado em botijões e o fator é por quilo; a conversão faz parte da conta. |

## Acessibilidade

- O nome da fonte e os dois subtítulos são cabeçalhos.
- Os sinais da conta são lidos como "vezes" e "igual a".
- A seta de voltar tem rótulo "Voltar" e área de toque maior que o desenho.
