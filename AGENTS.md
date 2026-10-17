# AGENTS.md

Instruções para agentes de código que trabalham neste repositório. Leia este arquivo inteiro antes de qualquer alteração.

## O que é este projeto

Aplicativo móvel (Android e iOS) que permite a pessoas e pequenos comércios registrar seus consumos, calcular as emissões de gases de efeito estufa correspondentes e descobrir quantas árvores seriam necessárias para neutralizá-las. O cálculo segue a lógica da ISO 14064. É um projeto acadêmico da disciplina de Educação Ambiental (UFC Quixadá, em parceria com o IFCE).

Os requisitos estão em `docs/requisitos.md`. A metodologia de cálculo está em `docs/metodologia-calculo.md`. O visual está em `docs/design.md`.

## Princípios que não se negociam

1. **Nada sai do aparelho.** O app não faz nenhuma requisição de rede. Não há servidor, banco de dados externo, login, analytics, telemetria nem relatório de erros remoto. A única forma de dados saírem do celular é o arquivo de backup que o próprio usuário exporta pelo menu de compartilhamento do sistema. A tela de boas-vindas promete isso ao usuário; quebrar essa regra transforma a promessa em mentira.
2. **Todo número é rastreável.** Todo fator de emissão tem valor, unidade, fonte bibliográfica e ano de referência. O app mostra ao usuário como cada resultado foi obtido (memória de cálculo). Nunca invente um fator de emissão ou uma taxa de sequestro: se o valor não estiver em `docs/metodologia-calculo.md`, pare e pergunte a uma pessoa da equipe.
3. **Reduzir antes de compensar.** Sugestões de redução aparecem antes da compensação por plantio. Não crie fluxos que levem o usuário direto ao plantio sem passar pelas sugestões.
4. **Cálculo separado da interface.** Toda regra de cálculo vive em `src/calculo/` como funções puras de TypeScript, sem React e sem acesso a banco. Isso permite testar o cálculo isoladamente e impede que uma mudança visual quebre a conta.

## Stack

- Expo (fluxo gerenciado) com Expo Router e TypeScript em modo `strict`.
- Armazenamento local: `expo-sqlite`.
- Backup: `expo-file-system` para gerar o arquivo, `expo-sharing` para abrir o menu de compartilhamento, `expo-document-picker` para importar.
- Gráfico em anel e animações: `react-native-svg` e `react-native-reanimated`.
- Fontes: `@expo-google-fonts/space-grotesk` e `@expo-google-fonts/ibm-plex-sans`.
- Testes: Jest com o preset `jest-expo` e `@testing-library/react-native`.

Instale dependências sempre com `npx expo install <pacote>`, que escolhe a versão compatível com o SDK do projeto. Antes de adicionar qualquer dependência nova, confirme que ela funciona sem rede e no Expo Go, e justifique a adição no pull request. Prefira não adicionar.

## Estrutura

```
src/app/          telas, seguindo as convenções de arquivo do Expo Router
src/calculo/      funções puras de cálculo e a tabela de fatores
src/dados/        acesso ao SQLite, migrações, exportação e importação de backup
src/ui/           tema (tokens), componentes reutilizáveis e hooks visuais
docs/             requisitos, metodologia, design
docs/iso/         cópias locais da norma — nunca versionadas
.agents/skills/   skills com procedimentos detalhados
```

Uma tela em `src/app/` nunca calcula nada: ela chama funções de `src/calculo/` e lê dados por meio de `src/dados/`.

## Convenções de código

- TypeScript `strict`, sem `any`. Tipos do domínio ficam em `src/calculo/tipos.ts`.
- Nomes do domínio em português, sem acentos: `fatorEmissao`, `periodo`, `fonteEmissao`. Termos de framework seguem em inglês.
- A unidade faz parte do nome: `emissaoKgCo2e`, `consumoKwh`, `volumeLitros`. Isso evita somar quilos com toneladas.
- Calcule sempre com precisão total e arredonde apenas na exibição. A quantidade de árvores é sempre arredondada para cima, porque arredondar para baixo deixaria emissões sem compensação.
- Números exibidos ao usuário usam o formato brasileiro, com `Intl.NumberFormat('pt-BR')`.
- Todo texto da interface é em português do Brasil, curto e sem jargão. Escreva "emissões" e não "inventário de GEE".
- Nenhuma cor, tamanho de fonte ou espaçamento literal em componentes: tudo vem de `src/ui/tema`.

## Tema e visual

O estilo é o "Carvão", descrito em `docs/design.md`. O tema claro é o padrão; o escuro é opcional e a escolha do usuário fica salva no aparelho. Toda tela precisa funcionar e ter contraste adequado nos dois temas.

## Antes de concluir uma tarefa

1. `npx tsc --noEmit` sem erros.
2. `npm test` passando.
3. Se a tarefa implementa um requisito, cite o identificador (por exemplo, RF03) na mensagem de commit e no pull request.
4. Se mudou um cálculo ou um fator, atualize `docs/metodologia-calculo.md` na mesma alteração.

Mensagens de commit seguem Conventional Commits, em português: `feat(calculo): adiciona fonte GLP (RF02)`.

## Skills

Procedimentos detalhados ficam em `.agents/skills/`. Consulte a skill correspondente antes de começar:

- `escrever-testes`: ao criar ou alterar qualquer código em `src/calculo/` ou `src/dados/`, ou ao corrigir um bug.
- `nova-fonte-de-emissao`: ao adicionar ou alterar uma fonte de emissão ou um fator.
- `privacidade-e-seguranca`: ao adicionar dependências, mexer em armazenamento, backup, permissões ou logs.
- `nova-tela`: ao criar ou alterar uma tela ou componente visual.

## Nunca faça

- Requisições de rede de qualquer tipo, inclusive para buscar fatores de emissão "atualizados".
- SDKs de analytics, telemetria, anúncios ou relatório de erros remoto.
- Alterar o valor de um fator existente: crie uma nova versão dele (ver a skill `nova-fonte-de-emissao`).
- Versionar qualquer arquivo de `docs/iso/` além do `README.md`.
- Pedir permissões que o app não usa (localização, contatos, câmera).
