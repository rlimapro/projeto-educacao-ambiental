---
name: nova-tela
description: Como criar ou alterar telas e componentes visuais no estilo Carvão, com tema claro e escuro. Use sempre que a tarefa envolver qualquer coisa em src/app/ ou src/ui/, layout, cores, tipografia, ícones, animações, gráficos, formulários, textos da interface ou acessibilidade, mesmo para ajustes pequenos.
---

# Nova tela

## Antes de começar

1. Leia `docs/design.md`. Ele define cores, tipografia, espaçamentos e os componentes base.
2. Verifique se já existe um componente em `src/ui/` que resolve o que você precisa. Reutilize antes de criar.
3. Identifique o requisito (RF) que a tela atende em `docs/requisitos.md`.

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
