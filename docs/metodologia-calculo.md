# Metodologia de cálculo

Este documento é a referência única para os cálculos do app. Ele resume, com as palavras da equipe, o que foi adotado a partir da ISO 14064 e de outras fontes. O código em `src/calculo/` deve corresponder exatamente ao que está aqui.

Itens marcados com **[A DEFINIR]** ainda não têm valor aprovado. Agentes de código não devem preencher esses campos por conta própria nem usar valores "típicos" encontrados na internet: a lacuna deve ser resolvida por uma pessoa da equipe, com fonte citada.

## Princípio

A emissão de cada fonte é o produto do dado de atividade pelo fator de emissão:

```
emissaoKgCo2e = consumo × fatorEmissao
```

O consumo é informado pelo usuário (kWh, litros, quilos). O fator converte essa quantidade em quilos de CO₂ equivalente. A emissão total do período é a soma das emissões de todas as fontes registradas.

Essa é a estrutura de quantificação da ISO 14064-1: dados de atividade multiplicados por fatores de emissão documentados. O app aplica essa lógica de forma simplificada a pessoas e pequenos comércios, sem a pretensão de produzir um inventário organizacional auditável.

## Unidade

Todos os cálculos internos usam **quilogramas de CO₂ equivalente (kg CO₂e)**. A conversão para toneladas, quando houver, acontece apenas na exibição.

## Fontes de emissão do MVP

| Fonte | Entrada do usuário | Fator | Unidade do fator | Fonte bibliográfica | Ano |
| --- | --- | --- | --- | --- | --- |
| Energia elétrica | kWh | [A DEFINIR] | kg CO₂e/kWh | [A DEFINIR] | [A DEFINIR] |
| Gasolina | litros | [A DEFINIR] | kg CO₂e/L | [A DEFINIR] | [A DEFINIR] |
| Etanol | litros | [A DEFINIR] | kg CO₂e/L | [A DEFINIR] | [A DEFINIR] |
| Diesel | litros | [A DEFINIR] | kg CO₂e/L | [A DEFINIR] | [A DEFINIR] |
| Gás de cozinha (GLP) | kg ou botijões de 13 kg | [A DEFINIR] | kg CO₂e/kg | [A DEFINIR] | [A DEFINIR] |

Candidatas a fonte, a confirmar com o especialista: o fator médio de emissão do Sistema Interligado Nacional publicado pelo MCTI para energia elétrica, e a ferramenta do Programa Brasileiro GHG Protocol ou as diretrizes do IPCC para combustíveis.

Observações de domínio a resolver:

- **Gasolina C.** A gasolina vendida nos postos brasileiros contém etanol anidro misturado. O fator usado deve ser o da gasolina C, não o da gasolina pura.
- **Carbono biogênico do etanol.** O CO₂ da queima de etanol é de origem biogênica e costuma ser contabilizado à parte. [A DEFINIR] se o app o soma ao total ou o exibe separadamente.
- **Deslocamentos por distância.** Se o usuário informar quilômetros em vez de litros, é necessário um consumo médio por tipo de veículo. [A DEFINIR] se o MVP aceita essa entrada.

## Compensação por plantio

### Árvores para neutralizar (RF05)

```
arvores = arredondarParaCima( emissaoKgCo2e / (sequestroKgPorArvorePorAno × horizonteAnos) )
```

| Parâmetro | Valor | Fonte | Observação |
| --- | --- | --- | --- |
| sequestroKgPorArvorePorAno | [A DEFINIR] | [A DEFINIR] | Depende de espécie, região e taxa de sobrevivência. Preferir referência para espécies da Caatinga. |
| horizonteAnos | 20 (proposta) | Decisão da equipe | Precisa ser exibido ao usuário junto do resultado. |

O arredondamento é sempre para cima, porque arredondar para baixo deixaria parte das emissões sem compensação.

### Sequestro líquido (RF06)

```
sequestroLiquidoKg = arvoresPlantadas × sequestroKgPorArvorePorAno × horizonteAnos − emissaoKgCo2e
```

Um valor positivo indica que o plantio simulado remove mais carbono do que o período emitiu.

### Linguagem ao usuário

Pela ISO 14068-1, declarar neutralidade de carbono exige ter reduzido emissões antes de compensar. Por isso o app usa expressões como "árvores que neutralizariam este mês" e nunca exibe selos do tipo "carbono neutro".

## Versionamento dos fatores

Cada fator em `src/calculo/fatores.ts` tem um identificador, valor, unidade, fonte, ano e versão. Ao atualizar um fator:

1. Não altere o registro existente. Crie um novo com a versão incrementada.
2. Períodos já registrados continuam usando a versão gravada no momento do registro.
3. Períodos novos usam a versão mais recente.
4. Atualize a tabela deste documento na mesma alteração.

## Arredondamento e exibição

- Cálculos usam precisão total; nada é arredondado em `src/calculo/` exceto a contagem de árvores.
- Na exibição, valores abaixo de 1.000 kg aparecem em quilos sem casas decimais; a partir disso, em toneladas com duas casas.
- Separador decimal brasileiro (vírgula), via `Intl.NumberFormat('pt-BR')`.
