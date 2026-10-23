// Formatação de números para exibição, no padrão brasileiro. Regras em
// docs/metodologia-calculo.md, seção "Arredondamento e exibição".

const quilos = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const toneladas = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

const MENOS = '−';

export type EmissaoFormatada = {
  valor: string;
  unidade: 'kg' | 't';
};

// Abaixo de 1.000 kg, em quilos sem casas decimais; a partir disso, em
// toneladas com duas casas.
export function formatarEmissao(emissaoKgCo2e: number): EmissaoFormatada {
  if (Math.abs(emissaoKgCo2e) >= 1000) {
    return { valor: toneladas.format(emissaoKgCo2e / 1000), unidade: 't' };
  }
  return { valor: quilos.format(emissaoKgCo2e), unidade: 'kg' };
}

export function formatarEmissaoComUnidade(emissaoKgCo2e: number): string {
  const { valor, unidade } = formatarEmissao(emissaoKgCo2e);
  return `${valor} ${unidade}`;
}

// Fração como percentual inteiro com sinal: −0,12 vira "−12%", 0,08 vira "+8%".
export function formatarVariacao(fracao: number): string {
  const percentual = Math.round(fracao * 100);
  if (percentual === 0) return '0%';
  const sinal = percentual < 0 ? MENOS : '+';
  return `${sinal}${inteiro.format(Math.abs(percentual))}%`;
}

// Fração como percentual inteiro sem sinal: 0,808 vira "81%".
export function formatarParticipacao(fracao: number): string {
  return `${inteiro.format(Math.round(fracao * 100))}%`;
}

const nomesDosMeses = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

// mes de 1 a 12. "outubro"; com maiuscula, "Outubro".
export function nomeDoMes(mes: number, maiuscula = false): string {
  const nome = nomesDosMeses[mes - 1] ?? '';
  return maiuscula ? nome.charAt(0).toUpperCase() + nome.slice(1) : nome;
}
