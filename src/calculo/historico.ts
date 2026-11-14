import { compararPeriodos } from './resumo';
import type { ComparacaoPeriodos } from './tipos';

// Histórico de emissões por mês (RF07). Funções puras: recebem os totais já
// calculados de cada mês registrado e não arredondam nada.

export type EmissaoMensal = {
  ano: number;
  // De 1 a 12.
  mes: number;
  totalKgCo2e: number;
};

export type Mes = {
  ano: number;
  mes: number;
};

// Mês de uma janela do gráfico; sem registro, o total é nulo (e não zero, que
// seria um mês registrado sem emissões).
export type MesDaJanela = Mes & {
  totalKgCo2e: number | null;
};

export type MesComparado = EmissaoMensal & {
  // Mês registrado imediatamente antes deste, que pode não ser o mês anterior
  // do calendário quando houver meses sem registro no meio.
  anterior: EmissaoMensal | null;
  comparacao: ComparacaoPeriodos | null;
};

export type ResumoAno = {
  ano: number;
  totalKgCo2e: number;
  mesesRegistrados: number;
  mediaMensalKgCo2e: number;
};

// Posição do mês numa contagem contínua, para comparar e deslocar meses.
function posicao({ ano, mes }: Mes): number {
  return ano * 12 + (mes - 1);
}

function deposicao(valor: number): Mes {
  return { ano: Math.floor(valor / 12), mes: (valor % 12) + 1 };
}

function validar(registros: EmissaoMensal[]): void {
  const vistos = new Set<number>();
  for (const registro of registros) {
    if (!Number.isInteger(registro.ano) || !Number.isInteger(registro.mes) || registro.mes < 1 || registro.mes > 12) {
      throw new Error(`Mês inválido: ${registro.mes}/${registro.ano}`);
    }
    if (!Number.isFinite(registro.totalKgCo2e) || registro.totalKgCo2e < 0) {
      throw new Error(`Emissão inválida em ${registro.mes}/${registro.ano}: ${registro.totalKgCo2e}`);
    }
    const p = posicao(registro);
    if (vistos.has(p)) {
      throw new Error(`Mês repetido: ${registro.mes}/${registro.ano}`);
    }
    vistos.add(p);
  }
}

// Mês deslocado: deslocarMes({ ano: 2026, mes: 1 }, -1) é dezembro de 2025.
export function deslocarMes(mes: Mes, quantidade: number): Mes {
  if (!Number.isInteger(quantidade)) {
    throw new Error(`Deslocamento inválido: ${quantidade}`);
  }
  return deposicao(posicao(mes) + quantidade);
}

// Mês registrado mais recente, ou nulo sem registros.
export function mesMaisRecente(registros: EmissaoMensal[]): Mes | null {
  validar(registros);
  let maior: EmissaoMensal | null = null;
  for (const registro of registros) {
    if (maior === null || posicao(registro) > posicao(maior)) maior = registro;
  }
  return maior && { ano: maior.ano, mes: maior.mes };
}

// Quantos meses o gráfico mostra: no máximo `maximo`, mas sem meses vazios
// antes do primeiro registro (com dois meses registrados, duas barras).
export function mesesNoGrafico(registros: EmissaoMensal[], maximo: number): number {
  validar(registros);
  if (registros.length === 0) return 0;
  const posicoes = registros.map(posicao);
  const meses = Math.max(...posicoes) - Math.min(...posicoes) + 1;
  return Math.min(maximo, meses);
}

// `quantidade` meses seguidos do calendário, do mais antigo ao que termina em
// `fim`, com o total de cada um ou nulo quando o mês não foi registrado.
export function janelaDeMeses(registros: EmissaoMensal[], fim: Mes, quantidade: number): MesDaJanela[] {
  validar(registros);
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error(`Quantidade de meses inválida: ${quantidade}`);
  }
  const porPosicao = new Map(registros.map((r) => [posicao(r), r.totalKgCo2e]));
  const ultimo = posicao(fim);
  return Array.from({ length: quantidade }, (_, i) => {
    const p = ultimo - (quantidade - 1) + i;
    return { ...deposicao(p), totalKgCo2e: porPosicao.get(p) ?? null };
  });
}

// Se há meses registrados antes do início e depois do fim de uma janela.
export function haMesesForaDaJanela(
  registros: EmissaoMensal[],
  fim: Mes,
  quantidade: number,
): { antes: boolean; depois: boolean } {
  validar(registros);
  const inicio = posicao(fim) - (quantidade - 1);
  return {
    antes: registros.some((r) => posicao(r) < inicio),
    depois: registros.some((r) => posicao(r) > posicao(fim)),
  };
}

// Cada mês registrado, do mais recente ao mais antigo, comparado ao mês
// registrado antes dele. O mais antigo não tem com o que comparar.
export function compararComMesAnterior(registros: EmissaoMensal[]): MesComparado[] {
  validar(registros);
  const ordenados = [...registros].sort((a, b) => posicao(b) - posicao(a));
  return ordenados.map((registro, i) => {
    const anterior = ordenados[i + 1] ?? null;
    return {
      ...registro,
      anterior,
      comparacao: anterior ? compararPeriodos(registro.totalKgCo2e, anterior.totalKgCo2e) : null,
    };
  });
}

// Soma e média dos meses registrados num ano. A média divide pelos meses
// registrados, e não por 12: um mês sem registro não é um mês sem emissões.
export function resumirAno(registros: EmissaoMensal[], ano: number): ResumoAno | null {
  validar(registros);
  const doAno = registros.filter((r) => r.ano === ano);
  if (doAno.length === 0) return null;
  const totalKgCo2e = doAno.reduce((soma, r) => soma + r.totalKgCo2e, 0);
  return {
    ano,
    totalKgCo2e,
    mesesRegistrados: doAno.length,
    mediaMensalKgCo2e: totalKgCo2e / doAno.length,
  };
}
