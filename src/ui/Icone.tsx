import type { ReactNode } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { useTema } from './tema';

export type NomeIcone = 'nuvem' | 'calculadora' | 'queda' | 'cadeado' | 'contraste';

type Props = {
  nome: NomeIcone;
  tamanho: number;
};

// Ícones de traço, sem preenchimento, como pede docs/design.md. São
// decorativos: o texto ao lado já diz o que significam.
export function Icone({ nome, tamanho }: Props) {
  const { cores } = useTema();

  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cores.marcaForte}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {desenhos[nome]}
    </Svg>
  );
}

const desenhos: Record<NomeIcone, ReactNode> = {
  nuvem: <Path d="M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.4A4.5 4.5 0 0 0 7 18z" />,
  calculadora: (
    <>
      <Rect x={5} y={3} width={14} height={18} rx={2} />
      <Line x1={8} y1={7} x2={16} y2={7} />
      <Line x1={9} y1={12} x2={9} y2={12} />
      <Line x1={12} y1={12} x2={12} y2={12} />
      <Line x1={15} y1={12} x2={15} y2={12} />
      <Line x1={9} y1={16} x2={9} y2={16} />
      <Line x1={12} y1={16} x2={12} y2={16} />
      <Line x1={15} y1={16} x2={15} y2={16} />
    </>
  ),
  queda: (
    <>
      <Polyline points="3,7 9,13 13,9 21,17" />
      <Polyline points="15,17 21,17 21,11" />
    </>
  ),
  cadeado: (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  contraste: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={12} y1={3} x2={12} y2={21} />
      <Line x1={12} y1={8} x2={19} y2={8} />
      <Line x1={12} y1={12} x2={20} y2={12} />
      <Line x1={12} y1={16} x2={19} y2={16} />
    </>
  ),
};
