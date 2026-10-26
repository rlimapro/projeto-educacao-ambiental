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
  veu: string;
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
    veu: 'rgba(13, 18, 16, 0.4)',
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
    veu: 'rgba(0, 0, 0, 0.6)',
  },
};

// Nomes registrados pelo useFonts no layout raiz.
export const familias = {
  numeros: 'SpaceGrotesk_600SemiBold',
  numerosNegrito: 'SpaceGrotesk_700Bold',
  numerosMedio: 'SpaceGrotesk_500Medium',
  texto: 'IBMPlexSans_400Regular',
  textoMedio: 'IBMPlexSans_500Medium',
  textoSemiNegrito: 'IBMPlexSans_600SemiBold',
} as const;

function estilo(
  fontFamily: string,
  fontSize: number,
  alturaLinha: number,
  letterSpacing?: number,
): TextStyle {
  return { fontFamily, fontSize, lineHeight: Math.round(fontSize * alturaLinha), letterSpacing };
}

export const tipografia = {
  numeroDestaque: estilo(familias.numerosNegrito, 52, 1.0, -1.56),
  titulo: estilo(familias.numerosNegrito, 34, 1.08, -0.68),
  numeroCartao: estilo(familias.numerosNegrito, 32, 1.0),
  subtitulo: estilo(familias.numerosNegrito, 18, 1.2),
  numeroLinha: estilo(familias.numerosNegrito, 15, 1.3),
  botao: estilo(familias.numerosNegrito, 17, 1.2),
  contador: estilo(familias.numerosMedio, 14, 1.3),
  corpo: estilo(familias.texto, 16, 1.5),
  opcao: estilo(familias.textoSemiNegrito, 16, 1.3),
  linha: estilo(familias.texto, 15, 1.3),
  item: estilo(familias.textoMedio, 15, 1.4),
  itemForte: estilo(familias.textoSemiNegrito, 15, 1.4),
  rotulo: estilo(familias.textoSemiNegrito, 13, 1.3),
  legenda: estilo(familias.texto, 13, 1.4),
  etiqueta: estilo(familias.textoMedio, 13, 1.3),
  nota: estilo(familias.texto, 12, 1.3),
  mini: estilo(familias.textoMedio, 12, 1.3),
  miniForte: estilo(familias.textoSemiNegrito, 12, 1.3),
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
  segmento: 10,
  linha: 14,
  cartao: 16,
  pilula: 999,
} as const;

export const medidas = {
  areaToqueMinima: 44,
  alturaBotao: 56,
  bordaCartao: 1,
  bordaSelecionada: 2,
  tamanhoIlustracao: 200,
  // Anel de emissões (docs/design.md): área de 210, anel de 190 com 19 de espessura.
  areaAnel: 210,
  diametroAnel: 190,
  espessuraAnel: 19,
  espacoEntreSegmentos: 4,
  marcadorLegenda: 10,
  raioMarcadorLegenda: 3,
  // Pílula atrás do ícone da aba ativa na barra de navegação.
  larguraIndicadorAba: 56,
  alturaIndicadorAba: 32,
  opacidadePressionado: 0.8,
} as const;
