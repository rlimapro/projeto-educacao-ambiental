# Telas de boas-vindas (RF12)

Aparecem só no primeiro uso, antes da tela inicial. Explicam o que o app faz, como a conta é feita e o que acontece com os dados, e pedem para quem é o cálculo (RF01). Os textos abaixo são a referência para `src/app/boas-vindas.tsx`: mudou aqui, muda lá, e vice-versa.

Visual: protótipo no Figma, telas "Boas-vindas · O app", "Privacidade" e "Perfil" ([arquivo](https://www.figma.com/design/HlJaNtDhNHMXjLkzh4tK47/App-de-Emiss%C3%B5es)). A tela "Uma conta que você pode conferir" não existe no protótipo e segue o mesmo modelo das demais.

## Regras

- São quatro telas. O topo mostra o contador ("01 / 04") e "Pular". O usuário avança com "Continuar" ou deslizando para o lado, e volta deslizando.
- "Pular" leva direto à última tela, a do perfil, para que ninguém comece o app sem escolher para quem é o cálculo.
- "Minha residência" e "Mês" vêm marcados. Ao tocar em "Começar", o app guarda no aparelho o perfil, o período e que as boas-vindas foram vistas, e não as mostra de novo.
- A escolha de tema não aparece aqui: fica em Ajustes, na seção Aparência.
- Nenhum número de fator ou de árvores aparece aqui: a metodologia ainda pode mudar, e a explicação do método vale de qualquer forma.
- Linguagem acessível: sem nome de norma técnica, "emissões" em vez de "GEE", "neutralizariam" em vez de "compensariam" (o protótipo usa "compensariam"; a metodologia pede "neutralizariam") e nunca "carbono neutro".
- Com a redução de movimento ativada no sistema, a troca de tela acontece sem animação.

## Textos

| # | Ilustração | Título | Texto | Conteúdo extra |
| --- | --- | --- | --- | --- |
| 1 | Anel de emissões com árvore | Descubra quanto você emite. | Registre seus consumos de energia, combustível e gás. O app calcula suas emissões e mostra quantas árvores as neutralizariam. | — |
| 2 | Conta (consumo × fator = emissão) | Uma conta que você pode conferir. | Cada consumo é multiplicado por um fator de emissão de fonte oficial. O app mostra a conta inteira: quanto você usou, o fator e de onde ele veio. | — |
| 3 | Cadeado | Seus dados ficam neste aparelho. | Nada é enviado a servidores. Sem conta, sem login, sem compartilhamento. | Funciona sem internet · Sem cadastro nem login · Backup só quando você pedir |
| 4 | — | Para quem é o cálculo? | Isso define quais consumos aparecem para preencher. Você pode mudar depois em Ajustes. | Para mim (Deslocamentos e consumo pessoal) · Minha residência (Energia, gás e veículos da casa) · Meu comércio (Energia, gás, combustível e entregas) · Período de referência: Mês ou Ano |

## O que cada tela promete

Cada frase acima é uma promessa ao usuário. Antes de mudar o app, confira se a promessa continua verdadeira:

| Tela | Promessa | Sustentada por |
| --- | --- | --- |
| 1 | Calcula emissões e árvores que as neutralizariam | RF03, RF05 |
| 2 | Fator de fonte oficial, conta mostrada por inteiro | RF04, `docs/metodologia-calculo.md` |
| 3 | Nada vai a servidores; sem internet, sem conta; backup só por pedido do usuário | RNF01, RNF02, RNF03, RF09, skill `privacidade-e-seguranca` |
| 4 | O perfil define os consumos e pode ser mudado em Ajustes | RF01; a tela Ajustes precisa permitir trocar perfil e período |
