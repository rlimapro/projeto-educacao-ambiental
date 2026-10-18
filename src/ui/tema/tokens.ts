import type { TextStyle } from 'react-native';

// Tokens do estilo Carvão. Valores definidos em docs/design.md; esta é a
// única fonte de cor, tipografia e espaçamento do app.

export type EsquemaCores = 'claro' | 'escuro';

export type Cores = {
  fundo: string;
  superficie: string;
  borda: string;
  texto: string;
  textoSuave: string;
  marca: string;
  sobreMarca: string;
  marcaForte: string;
  trilhaAnel: string;
  grafico1: string;
  grafico2: string;
  grafico3: string;
};

export const cores: Record<EsquemaCores, Cores> = {
  claro: {
    fundo: '#F4F6F3',
    superficie: '#FFFFFF',
    borda: '#DDE4DF',
    texto: '#0D1210',
    textoSuave: '#55625B',
    marca: '#C5F06A',
    sobreMarca: '#0D1210',
    marcaForte: '#3D6B0F',
    trilhaAnel: '#E6ECE8',
    grafico1: '#6AA521',
    grafico2: '#1F4D3C',
    grafico3: '#9CC4B0',
  },
  escuro: {
    fundo: '#0D1210',
    superficie: '#161D1A',
    borda: '#26302C',
    texto: '#EEF3F0',
    textoSuave: '#9BA8A1',
    marca: '#C5F06A',
    sobreMarca: '#0D1210',
    marcaForte: '#C5F06A',
    trilhaAnel: '#161D1A',
    grafico1: '#C5F06A',
    grafico2: '#6FAF8E',
    grafico3: '#3F6B58',
  },
};

// Nomes registrados pelo useFonts no layout raiz.
export const familias = {
  numeros: 'SpaceGrotesk_600SemiBold',
  texto: 'IBMPlexSans_400Regular',
  textoMedio: 'IBMPlexSans_500Medium',
} as const;

function estilo(fontFamily: string, fontSize: number, alturaLinha: number): TextStyle {
  return { fontFamily, fontSize, lineHeight: Math.round(fontSize * alturaLinha) };
}

export const tipografia = {
  numeroDestaque: estilo(familias.numeros, 52, 1.0),
  titulo: estilo(familias.numeros, 34, 1.08),
  numeroCartao: estilo(familias.numeros, 32, 1.0),
  subtitulo: estilo(familias.numeros, 18, 1.2),
  botao: estilo(familias.numeros, 17, 1.2),
  corpo: estilo(familias.texto, 16, 1.5),
  item: estilo(familias.textoMedio, 15, 1.4),
  legenda: estilo(familias.texto, 13, 1.4),
  mini: estilo(familias.textoMedio, 12, 1.3),
} satisfies Record<string, TextStyle>;

export const espacamento = {
  mini: 4,
  pp: 8,
  p: 12,
  m: 16,
  g: 20,
  gg: 24,
  xg: 32,
} as const;

export const margemTela = espacamento.g;

export const raios = {
  marcador: 4,
  linha: 14,
  cartao: 16,
  pilula: 999,
} as const;

export const medidas = {
  areaToqueMinima: 44,
  alturaBotao: 56,
  bordaCartao: 1,
} as const;
