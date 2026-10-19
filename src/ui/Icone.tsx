import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

import { useTema, type Cores } from './tema';

// Ícones exportados do protótipo no Figma (geometria original). A cor vem do
// tema para que funcionem nos dois esquemas. São decorativos: o texto ao lado
// já diz o que significam.

export type NomeIcone =
  | 'semInternet'
  | 'semCadastro'
  | 'backup'
  | 'pessoa'
  | 'residencia'
  | 'comercio'
  | 'radioVazio'
  | 'radioMarcado';

type Desenho = {
  tamanho: number;
  traco: number;
  render: (cor: string) => ReactNode;
};

const desenhos: Record<NomeIcone, Desenho> = {
  semInternet: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M1.66667 1.66667L18.3333 18.3333" />
        <Path d="M7.08333 13.6667C7.8622 12.9032 8.90936 12.4756 10 12.4756C11.0906 12.4756 12.1378 12.9032 12.9167 13.6667" />
        <Path d="M4.16667 10.5C5.37505 9.39488 6.88224 8.67027 8.5 8.41667" />
        <Path d="M14 8.83333C14.6907 9.29443 15.3087 9.85619 15.8333 10.5" />
        <Path d="M10 16.6667H10.0083" />
      </>
    ),
  },
  semCadastro: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M13.3333 6.66667C13.3333 8.50762 11.8409 10 10 10C8.15905 10 6.66667 8.50762 6.66667 6.66667C6.66667 4.82572 8.15905 3.33333 10 3.33333C11.8409 3.33333 13.3333 4.82572 13.3333 6.66667Z" />
        <Path d="M3.33333 17.5V16.6667C3.33333 15.3406 3.86012 14.0688 4.7978 13.1311C5.73548 12.1935 7.00725 11.6667 8.33333 11.6667H11.6667C12.9927 11.6667 14.2645 12.1935 15.2022 13.1311C16.1399 14.0688 16.6667 15.3406 16.6667 16.6667V17.5" />
      </>
    ),
  },
  backup: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M10 2.5V12.5" />
        <Path d="M5.83333 8.33333L10 12.5L14.1667 8.33333" />
        <Path d="M4.16667 17.5H15.8333" />
      </>
    ),
  },
  pessoa: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <>
        <Path d="M14.6667 7.33333C14.6667 9.35838 13.025 11 11 11C8.97496 11 7.33333 9.35838 7.33333 7.33333C7.33333 5.30829 8.97496 3.66667 11 3.66667C13.025 3.66667 14.6667 5.30829 14.6667 7.33333Z" />
        <Path d="M3.66667 19.25V18.3333C3.66667 16.8746 4.24613 15.4757 5.27758 14.4442C6.30903 13.4128 7.70798 12.8333 9.16667 12.8333H12.8333C14.292 12.8333 15.691 13.4128 16.7224 14.4442C17.7539 15.4757 18.3333 16.8746 18.3333 18.3333V19.25" />
      </>
    ),
  },
  residencia: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <Path d="M2.75 10.0833L11 3.66667L19.25 10.0833V18.3333C19.25 18.5764 19.1534 18.8096 18.9815 18.9815C18.8096 19.1534 18.5764 19.25 18.3333 19.25H13.75V13.75H8.25V19.25H3.66667C3.42355 19.25 3.19039 19.1534 3.01849 18.9815C2.84658 18.8096 2.75 18.5764 2.75 18.3333V10.0833Z" />
    ),
  },
  comercio: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <>
        <Path d="M2.75 8.25L4.58333 3.66667H17.4167L19.25 8.25" />
        <Path d="M3.66667 8.25V18.3333H18.3333V8.25" />
        <Path d="M2.75 8.25H19.25" />
        <Path d="M8.25 18.3333V12.8333H13.75V18.3333" />
      </>
    ),
  },
  radioVazio: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <Path d="M19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z" />
    ),
  },
  radioMarcado: {
    tamanho: 22,
    traco: 1.83333,
    render: (cor) => (
      <>
        <Path d="M19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z" />
        <Path
          d="M11 15.5833C13.5313 15.5833 15.5833 13.5313 15.5833 11C15.5833 8.46869 13.5313 6.41667 11 6.41667C8.46869 6.41667 6.41667 8.46869 6.41667 11C6.41667 13.5313 8.46869 15.5833 11 15.5833Z"
          fill={cor}
          stroke="none"
        />
      </>
    ),
  },
};

type Props = {
  nome: NomeIcone;
  cor?: keyof Cores;
};

export function Icone({ nome, cor = 'marcaForte' }: Props) {
  const { cores } = useTema();
  const { tamanho, traco, render } = desenhos[nome];
  const corTraco = cores[cor];

  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${tamanho} ${tamanho}`}
      fill="none"
      stroke={corTraco}
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {render(corTraco)}
    </Svg>
  );
}
