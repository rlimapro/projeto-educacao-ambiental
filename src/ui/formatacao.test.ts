import {
  abreviacaoDoMes,
  formatarEmissao,
  formatarEmissaoComUnidade,
  formatarEmissaoNaUnidade,
  formatarParticipacao,
  formatarVariacao,
  nomeDoMes,
} from './formatacao';

describe('formatarEmissao', () => {
  it('mostra quilos sem casas decimais abaixo de 1.000 kg', () => {
    expect(formatarEmissao(245.4)).toEqual({ valor: '245', unidade: 'kg' });
    expect(formatarEmissao(999.4)).toEqual({ valor: '999', unidade: 'kg' });
  });

  it('mostra toneladas com duas casas e vírgula a partir de 1.000 kg', () => {
    expect(formatarEmissao(1000)).toEqual({ valor: '1,00', unidade: 't' });
    expect(formatarEmissao(12345)).toEqual({ valor: '12,35', unidade: 't' });
  });

  it('mantém a unidade pedida, mesmo abaixo de 1.000 kg', () => {
    expect(formatarEmissaoNaUnidade(500, 't')).toBe('0,50');
    expect(formatarEmissaoNaUnidade(500, 'kg')).toBe('500');
  });

  it('junta valor e unidade', () => {
    expect(formatarEmissaoComUnidade(198)).toBe('198 kg');
  });
});

describe('formatarVariacao', () => {
  it('usa o sinal de menos tipográfico para reduções', () => {
    // −33 / 278 = −0,1187 → −12%
    expect(formatarVariacao(-33 / 278)).toBe('−12%');
  });

  it('usa + para aumentos', () => {
    expect(formatarVariacao(0.08)).toBe('+8%');
  });

  it('não mostra sinal quando não houve variação', () => {
    expect(formatarVariacao(0.001)).toBe('0%');
  });
});

describe('formatarParticipacao', () => {
  it('arredonda a fração para o percentual inteiro', () => {
    // 198 / 245 = 0,808 → 81%
    expect(formatarParticipacao(198 / 245)).toBe('81%');
  });
});

describe('nomeDoMes', () => {
  it('devolve o nome do mês em português', () => {
    expect(nomeDoMes(10)).toBe('outubro');
    expect(nomeDoMes(3, true)).toBe('Março');
  });
});

describe('abreviacaoDoMes', () => {
  it('devolve as três primeiras letras, com maiúscula', () => {
    expect(abreviacaoDoMes(1)).toBe('Jan');
    expect(abreviacaoDoMes(3)).toBe('Mar');
    expect(abreviacaoDoMes(12)).toBe('Dez');
  });
});
