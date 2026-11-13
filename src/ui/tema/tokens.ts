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
  perigo: string;
  trilhaAnel: string;
  grafico1: string;
  grafico2: string;
  grafico3: string;
  veu: string;
  // Posição inválida na distribuição de mudas (sobreposição ou fora do terreno).
  perigo: string;
  perigoFundo: string;
  // Espaço reservado por uma muda na distribuição.
  areaMuda: string;
  // Linhas de metro da grade do terreno.
  gradeTerreno: string;
  // Terreno arado: a terra, a encosta dos sulcos, a crista iluminada, a sombra
  // no fundo (também torrões escuros e terra úmida), pedrinhas e palha.
  terraArada: string;
  sulcoTerra: string;
  cristaTerra: string;
  sombraTerra: string;
  pedraTerra: string;
  palhaTerra: string;
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
    perigo: '#B42318',
    trilhaAnel: '#E6ECE8',
    grafico1: '#6AA521',
    grafico2: '#1F4D3C',
    grafico3: '#9CC4B0',
    veu: 'rgba(13, 18, 16, 0.4)',
    perigo: '#B3261E',
    perigoFundo: 'rgba(179, 38, 30, 0.14)',
    areaMuda: 'rgba(106, 165, 33, 0.16)',
    gradeTerreno: 'rgba(74, 54, 30, 0.14)',
    terraArada: '#DCC8A4',
    sulcoTerra: '#C6AA7E',
    cristaTerra: '#EEE2CB',
    sombraTerra: '#A98D63',
    pedraTerra: '#CFCABF',
    palhaTerra: '#EDDCA0',
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
    perigo: '#F97066',
    trilhaAnel: '#161D1A',
    grafico1: '#C5F06A',
    grafico2: '#6FAF8E',
    grafico3: '#3F6B58',
    veu: 'rgba(0, 0, 0, 0.6)',
    perigo: '#F2B8B5',
    perigoFundo: 'rgba(242, 184, 181, 0.18)',
    areaMuda: 'rgba(197, 240, 106, 0.14)',
    gradeTerreno: 'rgba(238, 225, 205, 0.09)',
    terraArada: '#30281F',
    sulcoTerra: '#221C16',
    cristaTerra: '#4A3D2E',
    sombraTerra: '#17120E',
    pedraTerra: '#5A564E',
    palhaTerra: '#5E5235',
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
  numeroControle: estilo(familias.numerosNegrito, 72, 1.0),
  numeroDestaque: estilo(familias.numerosNegrito, 52, 1.0, -1.56),
  titulo: estilo(familias.numerosNegrito, 34, 1.08, -0.68),
  tituloTela: estilo(familias.numerosNegrito, 24, 1.2),
  numeroCartao: estilo(familias.numerosNegrito, 32, 1.0),
  numeroResultado: estilo(familias.numerosNegrito, 44, 1.0, -1.32),
  tituloDetalhe: estilo(familias.numerosNegrito, 20, 1.2),
  subtitulo: estilo(familias.numerosNegrito, 18, 1.2),
  numeroLinha: estilo(familias.numerosNegrito, 15, 1.3),
  botao: estilo(familias.numerosNegrito, 17, 1.2),
  contador: estilo(familias.numerosMedio, 14, 1.3),
  corpo: estilo(familias.texto, 16, 1.5),
  unidadeResultado: estilo(familias.textoMedio, 18, 1.3),
  opcao: estilo(familias.textoSemiNegrito, 16, 1.3),
  linha: estilo(familias.texto, 15, 1.3),
  item: estilo(familias.textoMedio, 15, 1.4),
  itemForte: estilo(familias.textoSemiNegrito, 15, 1.4),
  rotulo: estilo(familias.textoSemiNegrito, 13, 1.3),
  legenda: estilo(familias.texto, 13, 1.4),
  apoio: estilo(familias.texto, 14, 1.4),
  apoioForte: estilo(familias.textoSemiNegrito, 14, 1.4),
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
  alturaCampo: 52,
  // Altura máxima do terreno desenhado na distribuição de mudas.
  alturaMaximaTerreno: 440,
  // Zoom máximo do terreno: uma muda (3 m × 2 m) chega a 96 × 64.
  pontosPorMetroMaximo: 32,
  // Lixeira que surge ao segurar um terreno, e quanto em volta dela ainda conta
  // como acerto. Com o terreno por cima, ela cresce para mostrar que vai tirar.
  lixeira: 72,
  folgaLixeira: 16,
  escalaLixeiraAtiva: 1.15,
  // Sulcos do terreno arado: nunca mais juntos que isto na tela, para os
  // torrões, pedras e palha caberem em qualquer zoom; abaixo do tamanho com
  // detalhes (só se o espaçamento chegar ao máximo de 5 m), eles viram ruído.
  sulcoMinimo: 12,
  sulcoComDetalhes: 12,
  // Copa a partir da qual vale desenhar a copa vista de cima; abaixo disso o
  // desenho nem se vê, e um círculo simples é mais leve para o aparelho.
  copaMinimaComDesenho: 10,
  // Copa a partir da qual cabe o número da muda dentro dela.
  copaMinimaComNumero: 18,
  // Muda arrastada, apagada no lugar de onde saiu.
  opacidadeOrigemMuda: 0.35,
  // Barras do gráfico de remoção ao longo do tempo (simulação de plantio).
  alturaBarra: 12,
  linhaReferencia: 2,
  // Círculo atrás do ícone de uma sugestão de redução.
  circuloIcone: 40,
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
  // Ponto das dicas na folha de ajuda, centrado na 1ª linha de tipografia.linha (altura 20).
  marcadorDica: 6,
  margemMarcadorDica: 7,
  // Pílula atrás do ícone da aba ativa na barra de navegação.
  larguraIndicadorAba: 56,
  alturaIndicadorAba: 32,
  opacidadePressionado: 0.8,
} as const;
