# Metodologia de cálculo

Este documento é a referência única para os cálculos do app. Ele resume, com as palavras da equipe, o que foi adotado a partir da ISO 14064-1 e de outras fontes. O código em `src/calculo/` deve corresponder exatamente ao que está aqui.

Itens marcados com **[A DEFINIR]** ainda não têm valor aprovado. Agentes de código não devem preencher esses campos por conta própria nem usar valores "típicos" encontrados na internet: a lacuna deve ser resolvida por uma pessoa da equipe, com fonte citada.

## Base normativa

A pedido do stakeholder, a referência do cálculo é a **ISO 14064-1:2018**. A norma define *como* quantificar emissões, mas não traz nenhum número: ela manda usar fatores "de origem reconhecida" e explicar a escolha. Por isso, cada número deste documento vem de uma fonte que a própria norma, ou o guia brasileiro dela, indica.

| Documento | O que usamos dele |
| --- | --- |
| ISO 14064-1:2018, cláusula 6 | Estrutura do cálculo (dado de atividade × fator), conversão para CO₂e com o GWP mais recente do IPCC em horizonte de 100 anos |
| ISO 14064-1:2018, Anexo D (normativo) | CO₂ biogênico é quantificado e informado separadamente; CH₄ e N₂O de biocombustíveis entram no total |
| ISO 14064-1:2018, Anexo E (normativo) | Eletricidade da rede pela abordagem por localização, com o fator médio da rede do ano do período ou, se ainda não publicado, o mais recente |
| ABNT NBR ISO 14064 — Guia de implementação para pequenos negócios (ABNT/Sebrae, 2015) | Indica, no Brasil, MCTI e Programa Brasileiro GHG Protocol como fontes de fatores e as Diretrizes do IPCC 2006 quando não houver fator nacional; desaconselha estimar por quilometragem quando há dado de combustível |
| ISO 14068-1:2023 | Hierarquia reduzir → remover → compensar; regras para declarar neutralidade (ver "Linguagem ao usuário") |
| ISO 14064-2:2019 | Referência para quantificar remoções por plantio (ver "Compensação por plantio") |

Cópias locais das normas ficam em `docs/iso/` (não versionadas).

## Princípio

A emissão de cada fonte é o produto do dado de atividade pelo fator de emissão:

```
emissaoKgCo2e = consumo × fatorEmissao
```

O consumo é informado pelo usuário (kWh, litros, quilos). O fator converte essa quantidade em quilos de CO₂ equivalente. A emissão total do período é a soma das emissões de todas as fontes registradas.

Essa é a estrutura de quantificação da ISO 14064-1 (cláusula 6.2.3, modelo "dado de atividade × fator de emissão"). O app aplica essa lógica de forma simplificada a pessoas e pequenos comércios, sem a pretensão de produzir um inventário organizacional auditável.

Cada fator de combustível já agrega os três gases (CO₂, CH₄ e N₂O) convertidos em CO₂e:

```
fatorKgCo2ePorLitro = Σ por gás ( fatorKgPorTj × energiaTjPorLitro × gwp )
```

A derivação de cada valor está em "Como os fatores foram obtidos", para que qualquer pessoa da equipe consiga refazer a conta.

## Unidade

Todos os cálculos internos usam **quilogramas de CO₂ equivalente (kg CO₂e)**. A conversão para toneladas, quando houver, acontece apenas na exibição.

## Fontes de emissão do MVP

O MVP cobre períodos **a partir de agosto de 2025**. Para períodos anteriores, valem outras misturas de biocombustível e seria preciso cadastrar mais versões dos fatores.

| Fonte | Entrada do usuário | Fator | Unidade do fator | CO₂ biogênico (informado à parte) | Fonte bibliográfica | Ano | Vigência |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Energia elétrica | kWh | 0,0461 | kg CO₂/kWh | — | MCTI, Fator médio anual do SIN para inventários, ano-base 2025 | 2025 | Períodos de 2025 em diante, até o MCTI publicar o fator anual de 2026 |
| Gasolina comum (E30) | litros | 1,6187 | kg CO₂e/L | 0,4748 kg CO₂/L | IPCC 2006; BEN 2025; IPCC AR6; mistura CNPE de 30% | 2025 | 01/08/2025 a 31/07/2026 |
| Gasolina comum (E32) | litros | 1,5738 | kg CO₂e/L | 0,5065 kg CO₂/L | IPCC 2006; BEN 2025; IPCC AR6; mistura CNPE de 32% | 2026 | A partir de 01/08/2026 |
| Etanol hidratado | litros | 0,0436 | kg CO₂e/L | 1,5108 kg CO₂/L | IPCC 2006; BEN 2025; IPCC AR6 | 2025 | A partir de 01/08/2025 |
| Diesel (B15) | litros | 2,2788 | kg CO₂e/L | 0,3522 kg CO₂/L | IPCC 2006; BEN 2025; IPCC AR6; mistura CNPE de 15% | 2025 | A partir de 01/08/2025 |
| Gás de cozinha (GLP) | kg ou botijões de 13 kg | 2,9407 | kg CO₂e/kg | — | IPCC 2006; BEN 2025; IPCC AR6 | 2025 | A partir de 01/08/2025 |

Para o usuário, o app mostra "Gasolina" e escolhe sozinho entre E30 e E32 pela data do período.

### Decisões de domínio

- **Gasolina C.** A gasolina vendida nos postos tem etanol anidro misturado: 30% de 01/08/2025 a 31/07/2026 e 32% desde 01/08/2026, por resolução do CNPE com base na Lei 14.993/2024. A gasolina premium continua com 25% e não está no MVP. O E32 foi aprovado por 180 dias, prorrogáveis. Se o percentual mudar, cria-se uma nova versão do fator com a nova data de vigência.
- **Carbono biogênico.** Segue o Anexo D da ISO 14064-1, que é normativo. O CO₂ da queima do etanol e do biodiesel **não entra no total**: aparece na memória de cálculo como uma linha separada, "CO₂ de origem renovável". O CH₄ e o N₂O dessas parcelas entram no total. Por isso o etanol hidratado tem um fator baixo, mas não zero.
- **Deslocamentos por distância.** O MVP aceita apenas litros. O guia ABNT/Sebrae só aceita estimar por quilometragem quando não há dado de combustível, porque o resultado depende de um consumo médio que o app teria de supor.
- **Eletricidade só com CO₂.** O MCTI publica o fator em t CO₂/MWh, sem CH₄ e N₂O. Usamos o valor como está, porque é o fator oficial indicado para inventários. 1 t/MWh equivale a 1 kg/kWh.
- **Ano do fator elétrico.** Pelo Anexo E, usa-se o fator do ano do período. Como o fator anual só sai depois que o ano termina, períodos do ano corrente usam o fator anual mais recente já publicado. Quando o MCTI publicar o fator anual de 2026, ele entra como nova versão, e períodos de 2026 registrados **depois disso** passam a usá-lo. Períodos já gravados mantêm a versão com que foram calculados (RNF04).

## Como os fatores foram obtidos

### Insumos

**Fatores por energia, IPCC 2006** (*2006 IPCC Guidelines for National Greenhouse Gas Inventories*, Volume 2). Para os combustíveis veiculares, os valores de CH₄ e N₂O vêm da Tabela 3.2.2. Para o GLP, da Tabela 2.5 (uso residencial). Os valores de CO₂ vêm da Tabela 1.4.

| Componente | CO₂ (kg/TJ) | CH₄ (kg/TJ) | N₂O (kg/TJ) | Observação |
| --- | --- | --- | --- | --- |
| Gasolina A (pura) | 69.300 | 3,8 | 5,7 | Categoria "veículo leve, 1995 ou posterior" |
| Etanol (anidro e hidratado) | 70.800 (biogênico) | 18 | 5,7 | CH₄ de "carros a etanol, Brasil"; o IPCC não dá N₂O para essa categoria, então usamos o da gasolina (mesma frota flex) |
| Diesel A (puro) | 74.100 | 3,9 | 3,9 | |
| Biodiesel | 70.800 (biogênico) | 3,9 | 3,9 | CH₄ e N₂O iguais aos do diesel, mesmo motor |
| GLP | 63.100 | 5 | 0,1 | Uso residencial |

**Densidade e poder calorífico inferior (PCI)**, do Balanço Energético Nacional 2025, ano-base 2024 (EPE), Tabela VIII.9:

| Componente | Densidade (kg/m³) | PCI (kcal/kg) | Energia por unidade |
| --- | --- | --- | --- |
| Gasolina automotiva | 742 | 10.400 | 3,230870 × 10⁻⁵ TJ/L |
| Álcool etílico anidro | 791 | 6.750 | 2,235437 × 10⁻⁵ TJ/L |
| Álcool etílico hidratado | 809 | 6.300 | 2,133886 × 10⁻⁵ TJ/L |
| Óleo diesel | 840 | 10.100 | 3,552081 × 10⁻⁵ TJ/L |
| Biodiesel (B100) | 880 | 9.000 | 3,315946 × 10⁻⁵ TJ/L |
| GLP | — | 11.100 | 4,647348 × 10⁻⁵ TJ/kg |

Energia por litro = densidade (kg/L) × PCI (kcal/kg) × 4,1868 × 10⁻⁹ TJ/kcal.

**Potencial de aquecimento global (GWP-100)**, do IPCC AR6, Grupo de Trabalho I, Tabela 7.15. A ISO 14064-1 pede o GWP mais recente do IPCC. O guia ABNT/Sebrae, de 2015, ainda citava o AR5.

| Gás | GWP-100 |
| --- | --- |
| CO₂ | 1 |
| CH₄ de origem fóssil | 29,8 |
| CH₄ de origem não fóssil (parcela de biocombustível) | 27,0 |
| N₂O | 273 |

**Misturas obrigatórias** (CNPE): gasolina comum com 30% de etanol anidro a partir de 01/08/2025 e 32% a partir de 01/08/2026; diesel com 15% de biodiesel (B15) a partir de 01/08/2025. A mistura é por volume: 1 L de E30 = 0,70 L de gasolina A + 0,30 L de etanol anidro.

### Resultado por gás

Os valores estão em kg por litro (GLP: kg por quilo). Os valores de CH₄ e N₂O já estão em CO₂e.

| Fonte | CO₂ fóssil | CH₄ | N₂O | **Total (kg CO₂e)** | CO₂ biogênico, à parte |
| --- | --- | --- | --- | --- | --- |
| Gasolina E30 | 1,5673 | 0,0058 | 0,0456 | **1,6187** | 0,4748 |
| Gasolina E32 | 1,5225 | 0,0060 | 0,0453 | **1,5738** | 0,5065 |
| Etanol hidratado | 0 | 0,0104 | 0,0332 | **0,0436** | 1,5108 |
| Diesel B15 | 2,2373 | 0,0040 | 0,0374 | **2,2788** | 0,3522 |
| GLP | 2,9325 | 0,0069 | 0,0013 | **2,9407** | — |

Conferência: o CO₂ do diesel puro calculado assim dá 2,63 kg/L, o mesmo valor do exemplo do guia ABNT/Sebrae.

Quando o app for implementado, a derivação acima deve existir também como função pura em `src/calculo/`, com teste que reproduza esta tabela. Assim, uma nova mistura ou um novo BEN exigem trocar só os insumos.

## Compensação por plantio

### O que as normas dizem

- A ISO 14064-1 e a 14064-2 tratam remoções de carbono, mas **não trazem taxa de sequestro por árvore**. A 14064-2 tem o conservadorismo como princípio (seção 4.7): na dúvida, remoções não devem ser superestimadas.
- A ISO 14068-1 só aceita compensação por créditos de carbono certificados, já realizados e aposentados. Plantar árvores por conta própria **não permite declarar neutralidade**. Isso reforça a regra de linguagem abaixo: o app mostra uma estimativa educativa, não uma compensação.

### Árvores para neutralizar (RF05)

```
arvores = arredondarParaCima( emissaoKgCo2e / (sequestroKgPorArvorePorAno × horizonteAnos) )
```

| Parâmetro | Valor | Fonte | Observação |
| --- | --- | --- | --- |
| sequestroKgPorArvorePorAno | [A DEFINIR] | [A DEFINIR] | A ISO não fornece o número. Caminho sugerido: taxa de remoção por hectare para a Caatinga (ou para floresta tropical seca nas tabelas de AFOLU do IPCC, Volume 4) dividida pela densidade de plantio de um projeto de restauração, descontando a mortalidade das mudas. A taxa por hectare, a densidade e a mortalidade precisam de fonte citada. Escolher o valor mais baixo do intervalo, pelo princípio de conservadorismo da ISO 14064-2. Precisa de revisão do especialista. |
| horizonteAnos | 20 (proposta) | Decisão da equipe | Precisa ser exibido ao usuário junto do resultado. |

O arredondamento é sempre para cima, porque arredondar para baixo deixaria parte das emissões sem compensação.

### Sequestro líquido (RF06)

```
sequestroLiquidoKg = arvoresPlantadas × sequestroKgPorArvorePorAno × horizonteAnos − emissaoKgCo2e
```

Um valor positivo indica que o plantio simulado remove mais carbono do que o período emitiu.

### Linguagem ao usuário

Pela ISO 14068-1, declarar neutralidade de carbono exige ter reduzido emissões antes de compensar e usar créditos certificados. Por isso o app usa expressões como "árvores que neutralizariam este mês" e nunca exibe selos do tipo "carbono neutro".

## Limitações conhecidas

- Fatores médios nacionais: não refletem o veículo, o fogão ou a distribuidora de energia de cada usuário.
- O app não calcula incerteza. O IPCC indica faixas de confiança para cada fator, e o CH₄ e o N₂O de veículos são os mais incertos (até um terço do valor central para cima ou para baixo). Como juntos pesam menos de 3% do fator, o efeito no total é pequeno.
- Escopo restrito às cinco fontes acima. Para residências e pequenos comércios, ficam de fora, por exemplo, o gás de ar-condicionado, os resíduos e as compras.

## Versionamento dos fatores

Cada fator em `src/calculo/fatores.ts` tem um identificador, valor, unidade, fonte, ano, versão e data de início de vigência. Ao atualizar um fator:

1. Não altere o registro existente. Crie um novo com a versão incrementada.
2. Períodos já registrados continuam usando a versão gravada no momento do registro.
3. Períodos novos usam a versão vigente na data do período: a mistura em vigor naquele mês e o fator elétrico anual mais recente já publicado.
4. Atualize a tabela deste documento na mesma alteração.

## Arredondamento e exibição

- Cálculos usam precisão total; nada é arredondado em `src/calculo/` exceto a contagem de árvores.
- Na exibição, valores abaixo de 1.000 kg aparecem em quilos sem casas decimais; a partir disso, em toneladas com duas casas.
- Separador decimal brasileiro (vírgula), via `Intl.NumberFormat('pt-BR')`.

## Referências

- ISO 14064-1:2018. *Greenhouse gases — Part 1: Specification with guidance at the organization level for quantification and reporting of greenhouse gas emissions and removals.*
- ISO 14064-2:2019. *Greenhouse gases — Part 2: Specification with guidance at the project level…*
- ISO 14068-1:2023. *Climate change management — Transition to net zero — Part 1: Carbon neutrality.*
- ABNT; Sebrae. *Guia de implementação: gestão de emissões e remoções de gases de efeito estufa — ABNT NBR ISO 14064.* Rio de Janeiro, 2015.
- MCTI. *Fatores de emissão de CO₂ pela geração de energia elétrica no SIN — fator médio para inventários* (planilha "Inventários Corporativos – 2026", série 2006–2026). https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao
- IPCC. *2006 IPCC Guidelines for National Greenhouse Gas Inventories*, Vol. 2, cap. 1 (Tab. 1.4), cap. 2 (Tab. 2.5) e cap. 3 (Tab. 3.2.2). https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html
- IPCC. *AR6 WGI*, cap. 7, Tabela 7.15 (2021). https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/
- EPE. *Balanço Energético Nacional 2025, ano-base 2024*, Tabela VIII.9.
- CNPE. Resoluções de mistura obrigatória: E30 e B15 a partir de 01/08/2025; E32 a partir de 01/08/2026. Lei 14.993/2024 (Combustível do Futuro).
