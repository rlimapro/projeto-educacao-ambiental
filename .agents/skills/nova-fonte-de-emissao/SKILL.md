---
name: nova-fonte-de-emissao
description: Procedimento para adicionar ou alterar uma fonte de emissão (energia, combustível, gás, deslocamento) ou um fator de emissão ou taxa de sequestro de árvores. Use sempre que a tarefa envolver fatores, conversões de consumo em CO2e, a tabela de fontes, o cálculo de árvores ou o arquivo src/calculo/fatores.ts, mesmo que a mudança pareça pequena.
---

# Nova fonte de emissão

## Regra principal

**Nunca invente um fator de emissão.** Todo fator usado pelo app precisa estar em `docs/metodologia-calculo.md`, com valor, unidade, fonte bibliográfica e ano. Se o campo estiver marcado como `[A DEFINIR]`, pare e informe que o fator precisa ser definido por uma pessoa da equipe. Não use um valor "típico" encontrado na internet nem um valor de exemplo como se fosse real.

O motivo: o app mostra ao usuário a fonte de cada número. Um fator inventado com aparência de oficial é pior que um campo vazio, porque engana quem confia na memória de cálculo.

## Passo a passo

1. **Confirme o fator na metodologia.** Abra `docs/metodologia-calculo.md` e localize a linha da fonte. Sem valor aprovado, interrompa aqui.
2. **Registre o fator** em `src/calculo/fatores.ts`:

   ```ts
   {
     id: 'glp',
     nome: 'Gás de cozinha',
     unidadeEntrada: 'kg',
     valor: /* valor da metodologia */,
     unidadeFator: 'kg CO2e/kg',
     fonte: /* referência exata da metodologia */,
     ano: /* ano da metodologia */,
     versao: 1,
     perfis: ['pessoa', 'residencia', 'comercio'],
   }
   ```

   `perfis` controla para quais tipos de uso (RF01) a fonte aparece no formulário.
3. **Escreva os testes** seguindo a skill `escrever-testes`, com um fator fictício e redondo.
4. **Adicione a entrada na interface**, seguindo a skill `nova-tela`. O campo mostra a unidade esperada ao lado do valor ("kWh", "litros", "botijões de 13 kg"), porque o erro de unidade é o erro mais comum de quem preenche.
5. **Atualize a metodologia**, se algo mudou, na mesma alteração.

## Alterar um fator existente

Não edite o valor de um fator existente. Crie um registro novo com o mesmo `id` e `versao` incrementada. Períodos já registrados guardam a versão com que foram calculados e precisam continuar mostrando o mesmo resultado; editar o valor no lugar mudaria silenciosamente o histórico do usuário (RNF04).

## Conversões de unidade

Quando o usuário informa uma unidade diferente da do fator (botijões em vez de quilos, por exemplo), a conversão fica numa função própria em `src/calculo/`, com teste, e aparece na memória de cálculo como um passo separado. Nunca embuta a conversão dentro do valor do fator.
