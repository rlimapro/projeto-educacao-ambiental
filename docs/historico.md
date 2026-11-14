# Tela Histórico (RF07)

Terceira aba do app. Mostra as emissões de cada mês registrado, para a pessoa acompanhar se está emitindo mais ou menos. Código em `src/app/(abas)/historico.tsx`; as contas ficam em `src/calculo/historico.ts`.

Visual: protótipo no Figma, tela "09 Histórico" (nós `6:69` claro e `7:474` escuro; ver `docs/design.md`).

## O que a tela mostra

| Parte | Conteúdo | Origem |
| --- | --- | --- |
| Cabeçalho | "Histórico" e "Emissões por mês · " seguido do perfil escolhido | `lerPerfil()` |
| Gráfico | Barras com a emissão de até seis meses seguidos, terminando no mês registrado mais recente, que fica em destaque. Valores em kg, com "Valores em kg CO₂e" abaixo | `janelaDeMeses`, `mesesNoGrafico` |
| Troca de meses | Setas e o intervalo ("Mai a out de 2026"), só quando há registros fora dos seis meses mostrados. Cada toque anda seis meses | `haMesesForaDaJanela`, `deslocarMes` |
| Resumo do ano | Total do ano do mês mais recente e média por mês registrado. Só aparece com dois ou mais meses registrados no ano | `resumirAno` |
| Últimos meses | Todos os meses registrados, do mais recente ao mais antigo, com a emissão e a variação em relação ao mês registrado antes dele. Tocar num mês abre a Início nele | `compararComMesAnterior` |

## Regras

- **Mês sem registro não é zero.** No gráfico, um mês sem registro aparece com "—" e sem barra; um mês registrado com zero tem barra de altura zero e o valor "0". A média do ano divide pelos meses registrados, e não por 12.
- **Comparação com o mês registrado antes.** Se julho não foi registrado, agosto é comparado com junho, como no cartão "Comparado a…" da Início. Para leitores de tela, o mês da comparação é dito por extenso ("20% a menos que junho").
- **Variação.** Queda em destaque, com a pílula em `marca`; alta ou estabilidade só com borda. O sinal no texto ("−12%", "+8%") diz o sentido sem depender da cor. Se o mês anterior teve zero, não há percentual, e a pílula mostra "—". O mês mais antigo não tem pílula.
- **Escala.** A maior barra dos meses mostrados tem 120 pontos; as outras são proporcionais, com no mínimo 4 para um mês com emissão não sumir ao lado de um mês muito maior (`src/ui/geometriaBarras.ts`).
- **Meses no gráfico.** Até seis, mas o gráfico começa no primeiro mês registrado: com dois meses, são duas barras, e não quatro meses vazios antes delas.

## Estados

- **Sem registros:** cartão "Nenhum mês registrado", que explica que a comparação começa no segundo mês, com o botão "Registrar consumo".
- **Um mês:** gráfico com uma barra, a lista com o mês e a frase "Registre o próximo mês para comparar."
- **Erro de leitura:** a mesma mensagem da Início ("Não foi possível abrir seus registros"), com o botão para registrar.
- **Carregando:** os registros são lidos de forma síncrona do armazenamento local, como na Início, então não há estado de carregamento.

## O que não está no protótipo

- Troca de meses do gráfico, para quem tem mais de seis meses registrados.
- Resumo do ano (total e média por mês). Vem antes da lista, para dar o panorama antes dos detalhes.
- Linhas da lista que abrem a Início no mês, com a seta `abrir`, como na legenda da Início.
- Barras que crescem a partir da base ao abrir a tela e ao trocar de meses (700 ms, como o anel), ou aparecem prontas com a redução de movimento ativada.

## Divergências do protótipo

| Protótipo | App | Motivo |
| --- | --- | --- |
| Espaço de 6 entre valor, barra e mês | 4 | Escala de espaçamento do `docs/design.md`. |
| Linhas da lista com 12 de espaço entre si | Linhas com a altura mínima de toque (44) e divisória | Cada linha abre o mês na Início; a altura final fica quase igual (45 contra 45). |
| Pílula com largura fixa de 56 | Largura mínima de 56 | Cresce com a fonte do sistema em vez de cortar o texto. |

## Acessibilidade

- O gráfico é anunciado como imagem, com cada mês em texto: "Emissões por mês, em quilos de CO₂e: maio de 2026, 310; junho de 2026, sem registro; …".
- Cada linha da lista é um botão com a emissão e a comparação por extenso: "Outubro de 2026: 245 kg, 12% a menos que setembro".
- Os valores e os meses do gráfico crescem com a fonte do sistema até 1,4 vez, para caberem na coluna de cada mês; o resto da tela cresce sem limite.
- As setas da troca de meses têm 44 × 44 e ficam desativadas (ícone em `borda`) quando não há meses daquele lado.

## Conferir na prévia web

`npm run previa:capturar -- "/historico?consumos=historico"` abre a tela com meses de outubro de 2025 a outubro de 2026, sem março; `?consumos=exemplo` mostra o caso com dois meses, e sem parâmetro, o estado vazio.
