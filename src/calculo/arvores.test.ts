import { TAXA_SEQUESTRO_SEM_ESTADO, arvoresParaNeutralizar } from './arvores';
import type { TaxaSequestro } from './tipos';

// Taxa fictícia e redonda, para a conta caber de cabeça.
const taxaDeTeste: TaxaSequestro = {
  id: 'teste',
  valorKgCo2PorArvorePorAno: 10,
  fonte: 'fictícia',
  ano: 2000,
  versao: 1,
};

describe('arvoresParaNeutralizar', () => {
  it('divide a emissão pelo que uma árvore remove no horizonte', () => {
    // 10 kg/ano × 20 anos = 200 kg por árvore; 400 / 200 = 2 árvores
    expect(arvoresParaNeutralizar(400, taxaDeTeste, 20)).toBe(2);
  });

  it('arredonda sempre para cima', () => {
    // 202 / 200 = 1,01 → 2 árvores
    expect(arvoresParaNeutralizar(202, taxaDeTeste, 20)).toBe(2);
  });

  it('emissão zero não pede nenhuma árvore', () => {
    expect(arvoresParaNeutralizar(0, taxaDeTeste, 20)).toBe(0);
  });

  it('usa 20 anos quando o horizonte não é informado', () => {
    // 10 × 20 = 200; 600 / 200 = 3
    expect(arvoresParaNeutralizar(600, taxaDeTeste)).toBe(3);
  });

  it('recusa emissão negativa', () => {
    expect(() => arvoresParaNeutralizar(-1, taxaDeTeste)).toThrow();
  });

  it('a taxa sem estado é a menor da metodologia, com fonte e versão', () => {
    expect(TAXA_SEQUESTRO_SEM_ESTADO.valorKgCo2PorArvorePorAno).toBeCloseTo(3.037, 6);
    expect(TAXA_SEQUESTRO_SEM_ESTADO.fonte).not.toHaveLength(0);
    expect(TAXA_SEQUESTRO_SEM_ESTADO.versao).toBe(1);
  });
});
