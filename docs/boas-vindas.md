# Telas de boas-vindas (RF12)

Aparecem só no primeiro uso, antes da tela inicial. Explicam o que o app faz, como a conta é feita e o que acontece com os dados. Os textos abaixo são a referência para `src/app/boas-vindas.tsx`: mudou aqui, muda lá, e vice-versa.

## Regras

- São cinco telas. O usuário avança com o botão "Próximo" ou deslizando para o lado, e volta com "Voltar".
- "Pular" aparece nas quatro primeiras telas e leva direto à última, a da escolha de tema, para que ninguém comece o app sem passar pelo botão "Começar".
- Ao tocar em "Começar", o app guarda no aparelho que as boas-vindas foram vistas e não as mostra de novo.
- Nenhum número de fator ou de árvores aparece aqui: a metodologia ainda pode mudar, e a explicação do método vale de qualquer forma.
- Os textos seguem o `AGENTS.md`: português do Brasil, frases curtas, "emissões" em vez de "GEE", "neutralizariam" em vez de "neutralizam", e nunca "carbono neutro".
- Com a redução de movimento ativada no sistema, a troca de tela acontece sem animação.

## Textos

| # | Ícone | Título | Texto |
| --- | --- | --- | --- |
| 1 | Nuvem | Quanto você emite? | Registre o que você consome, como energia, combustível e gás de cozinha, e descubra as emissões que vêm disso. Vale para você, para sua casa ou para seu comércio. |
| 2 | Calculadora | Uma conta que você pode conferir | Cada consumo é multiplicado por um fator de emissão, como manda a norma ISO 14064. O app mostra a conta inteira: quanto você usou, o fator aplicado e de onde ele veio. |
| 3 | Seta para baixo | Primeiro reduzir, depois compensar | O app mostra de onde vem a maior parte das suas emissões e sugere como diminuí-las. Só depois estima quantas árvores neutralizariam o que sobrar. |
| 4 | Cadeado | Seus dados ficam com você | Funciona sem internet, sem conta e sem cadastro. Nada sai do seu celular, a não ser um backup que você mesmo decida exportar. |
| 5 | Contraste | Como prefere ver o app? | Você pode mudar isso depois em Ajustes. *(seguido do seletor Claro, Escuro e Seguir o sistema, e do botão "Começar")* |

## O que cada tela promete

Cada frase acima é uma promessa ao usuário. Antes de mudar o app, confira se a promessa continua verdadeira:

| Tela | Promessa | Sustentada por |
| --- | --- | --- |
| 1 | Pessoa, casa ou comércio | RF01 |
| 2 | Conta pela ISO 14064, mostrada por inteiro | RF04, `docs/metodologia-calculo.md` |
| 3 | Sugestões de redução antes das árvores | RF08, princípio 3 do `AGENTS.md` |
| 4 | Sem internet, sem conta, nada sai do celular exceto o backup | RNF01, RNF02, RNF03, RF09, skill `privacidade-e-seguranca` |
| 5 | Tema pode ser mudado em Ajustes | RF11; a tela Ajustes precisa ter o seletor de tema |
