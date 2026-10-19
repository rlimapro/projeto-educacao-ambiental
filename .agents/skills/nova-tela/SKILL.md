---
name: nova-tela
description: Como criar ou alterar telas e componentes visuais no estilo Carvão, com tema claro e escuro. Use sempre que a tarefa envolver qualquer coisa em src/app/ ou src/ui/, layout, cores, tipografia, ícones, animações, gráficos, formulários, textos da interface ou acessibilidade, mesmo para ajustes pequenos.
---

# Nova tela

## Antes de começar

1. Leia `docs/design.md`. Ele define cores, tipografia, espaçamentos e os componentes base.
2. Verifique se a tela tem protótipo no Figma (tabela "Telas do protótipo" em `docs/design.md`). Se tiver, siga a seção "Implementar a partir do protótipo" abaixo.
3. Verifique se já existe um componente em `src/ui/` que resolve o que você precisa. Reutilize antes de criar.
4. Identifique o requisito (RF) que a tela atende em `docs/requisitos.md`.

## Implementar a partir do protótipo

Este é o fluxo usado nas telas de boas-vindas. Siga-o nas próximas telas.

### 1. Ler o protótipo sem desperdiçar chamadas

O plano gratuito do Figma permite poucas chamadas ao servidor MCP por período, por volta de uma dúzia. Ele bloqueou a sessão das boas-vindas no meio da leitura. Por isso:

- Pegue o identificador do nó na tabela de `docs/design.md`, e não pela listagem da página inteira.
- Para cada tela, faça **uma** chamada `get_design_context` (com a skill `figma-design-to-code` carregada antes). Ela traz o código de referência, as medidas, as fontes, os textos e os SVGs. Peça o `get_screenshot` só se a imagem não vier junto.
- A versão escura da tela só é necessária se a clara deixar dúvida: as cores do Figma são os tokens do tema, então o escuro sai dos tokens.
- **Baixe os SVGs na hora**, com `curl -L`, para uma pasta temporária: os links expiram em 7 dias. Nunca use esses links no código.

### 2. Traduzir para o projeto

O código que o Figma devolve é React para web com Tailwind. Ele é só referência; nada dele entra no app como está.

- **Cores:** cada hexadecimal do Figma corresponde a um token (`#F4F6F3` é `fundo`, `#3D6B0F` é `marcaForte` etc.). Use o token, nunca o hexadecimal.
- **Fontes:** confira peso e espaçamento entre letras com os tokens de `tipografia`. Se o protótipo usar uma combinação que ainda não existe, crie o token em `src/ui/tema/tokens.ts`, carregue a fonte no `_layout.tsx` e registre o token em `docs/design.md`.
- **Espaçamentos:** valores fora da escala (10, 14, 2) arredondam para o valor mais próximo de `espacamento`.
- **Posicionamento:** troque posições absolutas por flexbox. Áreas como "Espaço" ou `flex-1` no Figma viram `flexGrow`.
- **SVGs:** viram componentes do `react-native-svg` em `src/ui/Icone.tsx` (ícones) ou `src/ui/Ilustracao.tsx` (ilustrações). Copie o `d` de cada `Path` **sem alterar a geometria** e troque só as cores fixas pelos tokens, para o desenho acompanhar o tema escuro. Não adicione `react-native-svg-transformer` nem outra dependência para importar `.svg`.
- **Esconder SVG decorativo** dos leitores de tela com `aria-hidden`, e não com `accessible={false}` ou `importantForAccessibility`: essas duas propriedades geram avisos na versão web.
- **Componentes:** antes de montar a tela, procure em `src/ui/` (`BotaoPrimario`, `BotaoTexto`, `Cartao`, `LinhaLista`, `OpcaoCartao`, `SeletorSegmentado`…). Um elemento que aparece em mais de uma tela do protótipo vira componente em `src/ui/`, documentado em `docs/design.md`.
- **Interação:** decida o que é tocável (botões, opções, seletores) e use `accessibilityRole` (`button`, `radio`, `radiogroup`, `header`). Os testes encontram os elementos por esses papéis.

### 3. Quando o protótipo diverge das regras

As regras do `AGENTS.md` e da metodologia valem mais que o protótipo. Exemplos já encontrados:

- O protótipo dizia "compensariam"; o app usa "neutralizariam".
- Área de toque mínima de 44 pontos, mesmo que o protótipo desenhe 40.
- Nenhum nome de norma técnica no texto da tela: escreva "fator de emissão de fonte oficial", e não "ISO 14064".

Registre cada divergência no documento da tela (como `docs/boas-vindas.md`) e avise no pull request, para o protótipo ser corrigido também.

### 4. Conferir lado a lado

Use a prévia web (`scripts/previa-web/README.md`):

```bash
npm run previa:web                                   # terminal 1, porta 8099
npm run previa:capturar -- /rota Botão1 Botão2       # terminal 2
```

Compare cada captura com a imagem do protótipo e corrija até ficarem iguais, nos dois temas. O script também lista os avisos do console; a tela só está pronta sem nenhum. Erros que só a comparação revelou nas boas-vindas:

- **Listas horizontais em páginas** (`FlatList` com `pagingEnabled`): a célula não estica até a altura da lista. Meça a altura com `onLayout` e aplique-a em cada página, ou o conteúdo gruda no topo.
- **Servidor iniciado com `CI=1`**: ele não recarrega, e as capturas mostram código antigo.

Depois, confira no Expo Go, com a fonte do sistema no tamanho máximo.

## Regras de estilo

- **Tudo vem do tema.** Use o hook de tema de `src/ui/tema` para cores, tipografia e espaçamento. Nenhum hexadecimal, tamanho de fonte ou margem literal em componentes. Isso é o que faz o tema escuro funcionar sem retrabalho e mantém as telas coerentes entre as pessoas da equipe.
- **`marca` versus `marcaForte`.** O verde-limão (`marca`) é só preenchimento, com `sobreMarca` por cima. Texto e ícones em destaque usam `marcaForte`. No tema claro, usar `marca` como cor de texto deixa o texto ilegível.
- **Verifique os dois temas** antes de concluir.

## Acessibilidade

- Áreas de toque com pelo menos 44 × 44 pontos.
- Botões só com ícone têm `accessibilityLabel` em português.
- Gráficos têm um `accessibilityLabel` que descreve os valores ("Combustível 81%, gás 15%, energia 4%").
- Não desative o ajuste de tamanho de fonte do sistema. Teste com fonte grande: o layout deve crescer, não cortar.
- Animações respeitam a redução de movimento (hook `useReduzirMovimento` de `src/ui`).

## Texto

- Português do Brasil, frases curtas, sem jargão. "Emissões do mês", não "inventário de GEE do período".
- Toda quantidade mostra a unidade: "245 kg CO₂e", "180 kWh".
- Números formatados com `Intl.NumberFormat('pt-BR')`.
- Prefira "neutralizariam" a "neutralizam" ao falar de árvores: o plantio é uma estimativa, não um fato (ver `docs/metodologia-calculo.md`).

## Estados que toda tela precisa ter

- **Vazio:** primeiro uso, sem nenhum registro. Explique o que fazer, com um botão para a ação.
- **Carregando:** leitura do banco pode demorar em aparelhos lentos.
- **Erro:** mensagem em linguagem simples, com o que o usuário pode fazer.

## Gráfico em anel

Use o componente `AnelEmissoes` de `src/ui/`. Se ainda não existir, construa-o com `react-native-svg` (um `Circle` por segmento, usando `strokeDasharray` e `strokeDashoffset`) e anime o `strokeDashoffset` com `useAnimatedProps` do Reanimated. Detalhes de tamanho, ordem de cores e animação estão em `docs/design.md`.

## Navegação

As telas seguem as convenções de arquivo do Expo Router em `src/app/`. Uma tela não calcula nada: ela chama `src/calculo/` e lê dados por `src/dados/`.
