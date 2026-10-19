# Requisitos

Fonte oficial: documento de requisitos da disciplina, versão 2.0. Os itens RF09 a RF13 e o refinamento do RF05 foram acrescentados depois da definição técnica (outubro de 2026) e ainda precisam entrar no documento oficial.

## Requisitos funcionais

| ID | História de usuário |
| --- | --- |
| RF01 | Como usuário, quero indicar se estou calculando para mim, para minha residência ou para meu comércio, e informar o período de referência, para que o resultado tenha um recorte definido. |
| RF02 | Como usuário, quero registrar meus consumos do período, como energia elétrica, combustível, gás de cozinha e deslocamentos, para que sirvam de base ao cálculo. |
| RF03 | Como usuário, quero que o aplicativo calcule minhas emissões em CO₂ equivalente, mostrando o total e quanto vem de cada fonte, para saber onde está meu maior impacto. |
| RF04 | Como usuário, quero ver como o número foi obtido, com o consumo informado, o fator aplicado e a fonte desse fator, para entender o cálculo em vez de receber um resultado pronto. |
| RF05 | Como usuário, quero saber quantas árvores preciso plantar para neutralizar as emissões do período, calculadas com o crescimento típico das árvores da minha região, para zerar meu saldo. |
| RF06 | Como usuário, quero simular um plantio maior que o necessário e ver quanto carbono passo a sequestrar além do que emiti. |
| RF07 | Como usuário, quero comparar meus períodos anteriores, para acompanhar se estou emitindo mais ou menos. |
| RF08 | Como usuário, quero receber sugestões de redução voltadas às minhas maiores fontes, para agir antes de pensar em compensar. |
| RF09 | Como usuário, quero exportar meus dados para um arquivo e salvá-lo onde eu escolher, para não perdê-los ao trocar de celular. |
| RF10 | Como usuário, quero importar um arquivo de backup, para recuperar meus dados em outro aparelho. |
| RF11 | Como usuário, quero escolher entre tema claro e escuro, para usar o app da forma mais confortável. |
| RF12 | Como usuário, no primeiro uso, quero entender o que o app faz e que meus dados ficam só no meu aparelho, para usá-lo com confiança. |
| RF13 | Como usuário, quero informar o meu estado e receber sugestões de árvores nativas da minha região para plantar, para que o plantio ajude o ecossistema local. |

## Critérios de aceitação essenciais

- **RF03:** o total é a soma exata das fontes; a abertura por fonte mostra valor e percentual.
- **RF04:** para cada fonte, a tela mostra consumo, unidade, fator, unidade do fator, fonte bibliográfica e ano.
- **RF05:** o número de árvores é arredondado para cima e a tela exibe a taxa de sequestro e o horizonte de tempo considerados. A taxa é a do bioma escolhido pelo usuário (RF13). Sem estado escolhido, o app usa a menor taxa da tabela e convida o usuário a informar o estado.
- **RF13:** o usuário escolhe o estado numa lista das 27 unidades da federação (26 estados e o Distrito Federal), sem permissão de localização. O bioma predominante do estado vem preenchido, e o usuário pode trocá-lo por outro bioma presente no estado. As sugestões listam só espécies nativas daquele estado e daquele bioma, com nome popular e nome científico, e funcionam sem internet. A escolha fica salva no aparelho, pode ser alterada em Ajustes e entra no backup. As sugestões aparecem depois das sugestões de redução (RF08).
- **RF09:** o arquivo exportado contém um número de versão de formato; nada é enviado sem ação explícita do usuário.
- **RF10:** um arquivo inválido ou de versão desconhecida é recusado com mensagem clara, sem apagar os dados existentes.
- **RF11:** o tema claro é o padrão; a escolha persiste entre aberturas do app.

## Requisitos não funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| RNF01 | Offline | Todas as funções operam sem conexão com a internet. |
| RNF02 | Sem servidor | Não há backend, banco externo, contas de usuário nem requisições de rede. |
| RNF03 | Privacidade | Dados de consumo ficam apenas no aparelho, em conformidade com a LGPD. O usuário pode apagar todos os dados pelo app. |
| RNF04 | Rastreabilidade | Todo fator de emissão registra fonte e ano. Cada cálculo guarda a versão do fator usada, de modo que atualizar um fator não altera períodos já registrados. |
| RNF05 | Plataformas | Android e iOS a partir da mesma base de código, com Expo. |
| RNF06 | Acessibilidade | Contraste mínimo de 4,5:1 para texto, áreas de toque de pelo menos 44 pontos, rótulos de acessibilidade em botões só com ícone, respeito à configuração de redução de movimento. |
| RNF07 | Linguagem | Textos em português do Brasil, sem jargão técnico; termos da norma traduzidos para linguagem cotidiana. |
