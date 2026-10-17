---
name: escrever-testes
description: Como escrever e rodar testes neste app (Jest com jest-expo e Testing Library). Use sempre que criar ou alterar código em src/calculo ou src/dados, corrigir um bug, adicionar uma fonte de emissão ou mexer no backup, e quando alguém pedir testes, cobertura ou para "garantir que funciona", mesmo que a palavra teste não apareça.
---

# Escrever testes

## Onde o teste importa

O valor deste app está em números corretos. Um erro na conta não quebra nada visualmente: o app continua bonito e mostra um resultado errado com toda a confiança. Por isso o esforço de teste se concentra onde o erro é silencioso.

| Pasta | Exigência |
| --- | --- |
| `src/calculo/` | Toda função exportada tem teste. Sem exceção. |
| `src/dados/` | Exportação e importação de backup testadas de ponta a ponta (ida e volta). |
| `src/app/` e `src/ui/` | Apenas fluxos críticos: primeiro uso, registro de consumo, troca de tema. |

## Onde ficam os testes

Ao lado do arquivo testado, com o sufixo `.test.ts` ou `.test.tsx`:

```
src/calculo/emissoes.ts
src/calculo/emissoes.test.ts
```

## Como escrever

Nomes de teste em português, descrevendo o comportamento:

```ts
describe('calcularEmissao', () => {
  it('multiplica o consumo pelo fator da fonte', () => {
    const fator = { id: 'energia', valor: 0.1, unidade: 'kg/kWh', versao: 1 };
    // 150 kWh × 0,1 kg/kWh = 15 kg, calculado à mão
    expect(calcularEmissao(150, fator)).toBeCloseTo(15, 6);
  });
});
```

Regras:

- **Valores esperados calculados à mão**, com a conta escrita num comentário. Nunca copie para o `expect` o número que a própria função devolveu: isso só confirma que o código faz o que já faz.
- **`toBeCloseTo` para números decimais**, nunca `toBe`, porque ponto flutuante não é exato.
- **Fatores de teste são fictícios e redondos** (0,1; 2; 10). Isso mantém a conta verificável de cabeça e evita que um teste pareça validar um fator real que ainda não foi aprovado.
- **Não use mock nas funções de cálculo.** Elas são puras; teste-as diretamente.

## Casos que todo cálculo precisa cobrir

- Consumo zero resulta em emissão zero.
- Consumo negativo é rejeitado com erro.
- A soma das fontes é igual ao total.
- A memória de cálculo devolve o fator, a fonte e a versão usados.
- Árvores: o resultado é sempre arredondado para cima (por exemplo, 1,01 árvore vira 2).
- Um período registrado com a versão 1 de um fator continua usando a versão 1 depois que a versão 2 é criada.

## Backup

Teste a ida e volta: exportar, importar o mesmo conteúdo, comparar com o original. Teste também a recusa: arquivo com JSON inválido, com versão de formato desconhecida e com campos faltando. Em todos esses casos os dados já existentes precisam permanecer intactos.

O `expo-sqlite` não roda no ambiente do Jest. Isole o acesso ao banco atrás de funções em `src/dados/` e teste a lógica de serialização e validação separadamente do banco.

## Comandos

```bash
npm test                 # todos os testes
npm test -- --watch      # modo observação
npm test -- emissoes     # só os arquivos que casam com "emissoes"
```

Uma tarefa só está concluída com `npm test` passando.
