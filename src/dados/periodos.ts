import type { EmissaoFonte } from '@/calculo/tipos';

import { lerRegistrosConsumo } from './consumos';

export type PeriodoRegistrado = {
  id: string;
  ano: number;
  mes: number;
  fontes: EmissaoFonte[];
  quantidadeSugestoes: number;
};

// Lista somente dados informados e calculados no aparelho; períodos de exemplo
// do protótipo não são tratados como registros reais.
export function listarPeriodos(): PeriodoRegistrado[] {
  return lerRegistrosConsumo().map((registro) => ({
    id: registro.id,
    ano: registro.ano,
    mes: registro.mes,
    fontes: registro.calculo.fontes.map(({ id, nome, emissaoKgCo2e }) => ({ id, nome, emissaoKgCo2e })),
    quantidadeSugestoes: 0,
  }));
}
