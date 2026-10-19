// Tipos do domínio, compartilhados por cálculo, dados e telas.

// Para quem o cálculo é feito (RF01). Define quais fontes aparecem para preencher.
export type Perfil = 'pessoa' | 'residencia' | 'comercio';

// Recorte de tempo dos registros (RF01).
export type PeriodoReferencia = 'mes' | 'ano';
