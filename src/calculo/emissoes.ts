import { FATORES_EMISSAO, selecionarFatorGasolina } from './fatores';
import type { ConsumosInformados, FatorEmissao, FonteEmissaoId, MemoriaCalculoFonte, ResultadoEmissoes } from './tipos';

type Atividade = {
  id: FonteEmissaoId;
  consumo: number;
  unidadeInformada: string;
  fator: FatorEmissao;
  multiplicador?: number;
  unidadeConvertida?: string;
};

export function calcularEmissao(consumo: number, fator: FatorEmissao): number {
  if (!Number.isFinite(consumo) || consumo < 0) {
    throw new Error('O consumo precisa ser um número finito igual ou maior que zero');
  }
  if (!Number.isFinite(fator.valor) || fator.valor < 0) {
    throw new Error('O fator de emissão é inválido');
  }
  return consumo * fator.valor;
}

export function converterBotoesGlpParaQuilos(botoes: number): number {
  if (!Number.isFinite(botoes) || botoes < 0) {
    throw new Error('A quantidade de botijões precisa ser um número finito igual ou maior que zero');
  }
  // Um botijão doméstico informado na interface contém 13 kg de GLP.
  return botoes * 13;
}

export function calcularEmissoes(
  consumos: ConsumosInformados,
  ano: number,
  mes: number,
): ResultadoEmissoes {
  for (const consumo of Object.values(consumos)) {
    if (!Number.isFinite(consumo) || consumo < 0) {
      throw new Error('Todos os consumos precisam ser números finitos iguais ou maiores que zero');
    }
  }

  const atividades: Atividade[] = [
    { id: 'energia', consumo: consumos.energiaKwh, unidadeInformada: 'kWh', fator: FATORES_EMISSAO.energia },
    { id: 'gasolina', consumo: consumos.gasolinaLitros, unidadeInformada: 'L', fator: selecionarFatorGasolina(ano, mes) },
    { id: 'etanol', consumo: consumos.etanolLitros, unidadeInformada: 'L', fator: FATORES_EMISSAO.etanol },
    { id: 'diesel', consumo: consumos.dieselLitros, unidadeInformada: 'L', fator: FATORES_EMISSAO.diesel },
    {
      id: 'glp',
      consumo: consumos.glpBotoes13Kg,
      unidadeInformada: 'botijão de 13 kg',
      fator: FATORES_EMISSAO.glp,
      multiplicador: 13,
      unidadeConvertida: 'kg',
    },
  ];

  const fontes: MemoriaCalculoFonte[] = atividades
    .filter((atividade) => atividade.consumo > 0)
    .map((atividade) => {
      const consumoAplicado = atividade.multiplicador
        ? atividade.consumo * atividade.multiplicador
        : atividade.consumo;
      return {
        id: atividade.id,
        nome: atividade.fator.nome,
        consumoInformado: atividade.consumo,
        unidadeInformada: atividade.unidadeInformada,
        consumoAplicado,
        fator: { ...atividade.fator, perfis: [...atividade.fator.perfis] },
        conversao: atividade.multiplicador
          ? { multiplicador: atividade.multiplicador, unidadeResultado: atividade.unidadeConvertida ?? '' }
          : undefined,
        emissaoKgCo2e: calcularEmissao(consumoAplicado, atividade.fator),
      };
    });

  return {
    totalKgCo2e: fontes.reduce((total, fonte) => total + fonte.emissaoKgCo2e, 0),
    fontes,
  };
}
