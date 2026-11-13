// Tipos do domínio, compartilhados por cálculo, dados e telas.

// Para quem o cálculo é feito (RF01). Define quais fontes aparecem para preencher.
export type Perfil = 'pessoa' | 'residencia' | 'comercio';

// Recorte de tempo dos registros (RF01).
export type PeriodoReferencia = 'mes' | 'ano';

// Emissão já calculada de uma fonte num período (RF03).
export type EmissaoFonte = {
  id: string;
  nome: string;
  emissaoKgCo2e: number;
};

export type FonteEmissaoId = 'energia' | 'gasolina' | 'etanol' | 'diesel' | 'glp';

export type FatorEmissao = {
  id: FonteEmissaoId | 'gasolina-e30' | 'gasolina-e32';
  nome: string;
  unidadeEntrada: 'kWh' | 'L' | 'kg';
  valor: number;
  unidadeFator: string;
  fonte: string;
  ano: number;
  versao: number;
  perfis: Perfil[];
};

export type ConsumosInformados = {
  energiaKwh: number;
  gasolinaLitros: number;
  etanolLitros: number;
  dieselLitros: number;
  glpBotoes13Kg: number;
};

export type MemoriaCalculoFonte = EmissaoFonte & {
  consumoInformado: number;
  unidadeInformada: string;
  consumoAplicado: number;
  fator: FatorEmissao;
  conversao?: { multiplicador: number; unidadeResultado: string };
};

export type ResultadoEmissoes = {
  totalKgCo2e: number;
  fontes: MemoriaCalculoFonte[];
};

// Fonte com sua participação no total do período, em fração de 0 a 1.
export type ParticipacaoFonte = EmissaoFonte & {
  fracao: number;
};

export type ResumoEmissoes = {
  totalKgCo2e: number;
  // Da maior para a menor emissão.
  fontes: ParticipacaoFonte[];
};

export type ComparacaoPeriodos = {
  // Positivo quando o período atual emitiu mais.
  diferencaKgCo2e: number;
  // Fração da variação (−0,12 é 12% a menos). Nula quando o anterior foi zero.
  variacao: number | null;
};

// Taxa de remoção de CO₂ por árvore, com origem rastreável (RF05).
export type TaxaSequestro = {
  id: string;
  valorKgCo2PorArvorePorAno: number;
  fonte: string;
  ano: number;
  versao: number;
};

// Taxa de um grupo de biomas (RF06, RF13), com a variação típica em torno da
// média: desvio-padrão ÷ média da Tabela 4.9 do IPCC 2019, arredondado.
export type TaxaSequestroBioma = TaxaSequestro & {
  // Como aparece para o usuário: "Cerrado, Caatinga e Pantanal".
  biomas: string;
  // Fração de 0 a 1 (0,45 é "cerca de 45% acima ou abaixo").
  variacaoRelativa: number;
};

// Sugestões de redução (RF08). As fontes se agrupam como o usuário as vê:
// gasolina, etanol e diesel são todos "combustível".
export type GrupoFonte = 'combustivel' | 'energia' | 'gas';

// Qualitativo: compara as sugestões de um mesmo grupo (critérios em
// docs/sugestoes-reducao.md). Não é uma estimativa em kg.
export type ImpactoSugestao = 'alto' | 'medio' | 'baixo';

// Nomes dos desenhos em src/ui/Icone.tsx usados nas sugestões.
export type IconeSugestao =
  | 'rota'
  | 'pessoas'
  | 'alvo'
  | 'bicicleta'
  | 'folha'
  | 'velocimetro'
  | 'ferramenta'
  | 'gota'
  | 'termometro'
  | 'geladeira'
  | 'lampada'
  | 'sol'
  | 'tomada'
  | 'panela'
  | 'chama';

export type SugestaoReducao = {
  id: string;
  grupo: GrupoFonte;
  titulo: string;
  descricao: string;
  impacto: ImpactoSugestao;
  icone: IconeSugestao;
  perfis: Perfil[];
  // Só aparece se uma destas fontes tiver emissão no mês.
  exigeFonte?: FonteEmissaoId[];
};

export type GrupoComSugestoes = {
  grupo: GrupoFonte;
  nome: string;
  emissaoKgCo2e: number;
  // Fração do total do mês, de 0 a 1.
  fracao: number;
  // Da de maior impacto para a de menor.
  sugestoes: SugestaoReducao[];
};
