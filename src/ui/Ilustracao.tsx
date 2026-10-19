import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { medidas, useTema, type Cores } from './tema';

// Ilustrações das boas-vindas. "anel" e "cadeado" foram exportadas do
// protótipo no Figma (geometria original, cores trocadas pelos tokens do
// tema). "conta" não existe no protótipo e segue o mesmo desenho do cadeado.

export type NomeIlustracao = 'anel' | 'conta' | 'cadeado';

export function Ilustracao({ nome }: { nome: NomeIlustracao }) {
  const { cores } = useTema();
  const tamanho = medidas.tamanhoIlustracao;

  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
    >
      {desenhos[nome](cores)}
    </Svg>
  );
}

// Moldura dupla usada pelo cadeado e pela conta.
function Moldura({ cores }: { cores: Cores }) {
  return (
    <>
      <Path
        d="M52 4H148C174.51 4 196 25.4903 196 52V148C196 174.51 174.51 196 148 196H52C25.4903 196 4 174.51 4 148V52C4 25.4903 25.4903 4 52 4Z"
        stroke={cores.borda}
        strokeWidth={1.5}
      />
      <Path
        d="M134 30H66C46.1177 30 30 46.1177 30 66V134C30 153.882 46.1177 170 66 170H134C153.882 170 170 153.882 170 134V66C170 46.1177 153.882 30 134 30Z"
        fill={cores.superficie}
        stroke={cores.borda}
        strokeWidth={1.5}
      />
      <Path
        d="M170 37C173.866 37 177 33.866 177 30C177 26.134 173.866 23 170 23C166.134 23 163 26.134 163 30C163 33.866 166.134 37 170 37Z"
        fill={cores.marca}
        stroke={cores.texto}
        strokeWidth={2}
      />
    </>
  );
}

const desenhos: Record<NomeIlustracao, (cores: Cores) => ReactNode> = {
  anel: (cores) => (
    <>
      <Path
        d="M200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100C0 44.7715 44.7715 0 100 0C155.228 0 200 44.7715 200 100ZM22 100C22 143.078 56.9218 178 100 178C143.078 178 178 143.078 178 100C178 56.9218 143.078 22 100 22C56.9218 22 22 56.9218 22 100Z"
        fill={cores.trilhaAnel}
      />
      <Path
        d="M100 0C115.633 -6.83348e-07 131.049 3.66527 145.009 10.7016C158.969 17.7379 171.085 27.9492 180.384 40.5158C189.684 53.0825 195.907 67.6543 198.555 83.0616C201.203 98.4689 200.202 114.282 195.632 129.233C191.062 144.183 183.05 157.854 172.24 169.147C161.431 180.441 148.123 189.042 133.387 194.262C118.651 199.481 102.897 201.173 87.3882 199.202C71.8798 197.23 57.0498 191.65 44.0884 182.909L56.389 164.669C66.4988 171.487 78.0663 175.839 90.1628 177.377C102.259 178.915 114.548 177.595 126.042 173.524C137.536 169.453 147.916 162.744 156.348 153.935C164.779 145.126 171.028 134.463 174.593 122.802C178.157 111.14 178.938 98.8057 176.873 86.788C174.807 74.7704 169.953 63.4043 162.7 53.6024C155.446 43.8004 145.996 35.8356 135.107 30.3472C124.218 24.8589 112.194 22 100 22L100 0Z"
        fill={cores.grafico1}
      />
      <Path
        d="M41.2215 180.902C20.2552 165.669 6.02145 142.891 1.52004 117.369C-2.98138 91.8476 2.60112 65.5749 17.091 44.0885L35.331 56.389C24.0289 73.1485 19.6745 93.6411 23.1856 113.548C26.6967 133.455 37.799 151.222 54.1528 163.103L41.2215 180.902Z"
        fill={cores.grafico2}
      />
      <Path
        d="M19.0983 41.2215C28.0267 28.9326 39.6372 18.8392 53.0487 11.7074C66.4602 4.57561 81.3202 0.592776 96.5007 0.0612432L97.2706 22.0478C85.4298 22.4624 73.839 25.569 63.378 31.1318C52.917 36.6946 43.8608 44.5675 36.8967 54.1527L19.0983 41.2215Z"
        fill={cores.grafico3}
      />
      <Path
        d="M100 123.333V107"
        stroke={cores.marcaForte}
        strokeWidth={4.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M100 107C90.6667 107 83.6667 101.167 83.6667 93C83.6667 88.6681 85.3875 84.5137 88.4506 81.4506C91.5137 78.3875 95.6681 76.6667 100 76.6667C104.332 76.6667 108.486 78.3875 111.549 81.4506C114.613 84.5137 116.333 88.6681 116.333 93C116.333 101.167 109.333 107 100 107Z"
        stroke={cores.marcaForte}
        strokeWidth={4.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  conta: (cores) => (
    <>
      <Moldura cores={cores} />
      <Rect x={66} y={56} width={68} height={14} rx={7} fill={cores.borda} />
      <Path
        d="M94 80L106 92M106 80L94 92"
        stroke={cores.texto}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Rect x={66} y={102} width={68} height={14} rx={7} fill={cores.borda} />
      <Path
        d="M93 126H107M93 132H107"
        stroke={cores.texto}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Rect
        x={58}
        y={142}
        width={84}
        height={16}
        rx={8}
        fill={cores.marca}
        stroke={cores.texto}
        strokeWidth={3.5}
      />
    </>
  ),
  cadeado: (cores) => (
    <>
      <Moldura cores={cores} />
      <Path
        d="M116 94H84C78.4772 94 74 98.4772 74 104V126C74 131.523 78.4772 136 84 136H116C121.523 136 126 131.523 126 126V104C126 98.4772 121.523 94 116 94Z"
        fill={cores.marca}
        stroke={cores.texto}
        strokeWidth={3.5}
      />
      <Path
        d="M84 94V80C84 75.7565 85.6857 71.6869 88.6863 68.6863C91.6869 65.6857 95.7565 64 100 64C104.243 64 108.313 65.6857 111.314 68.6863C114.314 71.6869 116 75.7565 116 80V94"
        stroke={cores.texto}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Circle cx={100} cy={114} r={5} fill={cores.sobreMarca} />
    </>
  ),
};
