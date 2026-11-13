import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconeSugestao } from '@/calculo/tipos';

import { useTema, type Cores } from './tema';

// Ícones exportados do protótipo no Figma (geometria original). A cor vem do
// tema para que funcionem nos dois esquemas. São decorativos: o texto ao lado
// já diz o que significam.
//
// Os ícones de sugestão que não existem no protótipo (marcados abaixo) seguem
// o desenho do Lucide (https://lucide.dev, licença ISC, © Lucide Contributors),
// a mesma família visual dos ícones do protótipo.

export type NomeIcone =
  | 'semInternet'
  | 'semCadastro'
  | 'backup'
  | 'pessoa'
  | 'residencia'
  | 'comercio'
  | 'radioVazio'
  | 'radioMarcado'
  | 'abrirPeriodo'
  | 'abrir'
  | 'anterior'
  | 'voltar'
  | 'ajuda'
  | 'arvore'
  | 'menos'
  | 'mais'
  | 'marcado'
  | 'sugestao'
  | 'lixeira'
  | 'navInicio'
  | 'navRegistrar'
  | 'navHistorico'
  | 'navAjustes'
  | IconeSugestao;

type Desenho = {
  tamanho: number;
  // Grade em que o desenho foi feito, quando difere do tamanho exibido.
  caixa?: number;
  traco: number;
  // fundo: cor do que está atrás do ícone, para preencher partes vazadas.
  render: (cor: string, fundo: string) => ReactNode;
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
  abrirPeriodo: {
    tamanho: 18,
    traco: 1.5,
    render: () => <Path d="M4.5 6.75L9 11.25L13.5 6.75" />,
  },
  abrir: {
    tamanho: 18,
    traco: 1.5,
    render: () => <Path d="M6.75 4.5L11.25 9L6.75 13.5" />,
  },
  // Espelho de "abrir"; não existe no protótipo.
  anterior: {
    tamanho: 18,
    traco: 1.5,
    render: () => <Path d="M11.25 4.5L6.75 9L11.25 13.5" />,
  },
  voltar: {
    tamanho: 24,
    traco: 2,
    render: () => <Path d="M15 18L9 12L15 6" />,
  },
  // Simulação de plantio (RF06), do protótipo.
  arvore: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <>
        <Path d="M11 20.1667V13.75" />
        <Path d="M11 13.75C7.33333 13.75 4.58333 11.4583 4.58333 8.25C4.58333 6.54819 5.25937 4.91609 6.46273 3.71273C7.66609 2.50937 9.29819 1.83333 11 1.83333C12.7018 1.83333 14.3339 2.50937 15.5373 3.71273C16.7406 4.91609 17.4167 6.54819 17.4167 8.25C17.4167 11.4583 14.6667 13.75 11 13.75Z" />
      </>
    ),
  },
  menos: {
    tamanho: 24,
    traco: 2,
    render: () => <Path d="M5 12H19" />,
  },
  mais: {
    tamanho: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M12 5V19" />
        <Path d="M5 12H19" />
      </>
    ),
  },
  // Mês marcado na escolha de vários meses. Não existe no protótipo (Lucide).
  // Traço 3 na grade de 24 exibida com 16 dá o traço visual de 2.
  marcado: {
    tamanho: 16,
    caixa: 24,
    traco: 3,
    render: () => <Path d="M20 6 9 17l-5-5" />,
  },
  // Não existe no protótipo; segue o traço e o tamanho do ícone "adicionar".
  ajuda: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" />
        <Path d="M7.575 7.5C7.77093 6.94306 8.15764 6.47342 8.66664 6.17428C9.17564 5.87513 9.77409 5.76578 10.356 5.86559C10.9379 5.96541 11.4657 6.26795 11.8459 6.71963C12.2261 7.17131 12.4342 7.74296 12.4333 8.33333C12.4333 10 9.93333 10.8333 9.93333 10.8333" />
        <Path d="M10 14.1667H10.0083" />
      </>
    ),
  },
  sugestao: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <>
        <Path d="M8.25 16.5H13.75" />
        <Path d="M9.16667 20.1667H12.8333" />
        <Path d="M11 1.83333C9.64493 1.8455 8.32849 2.28636 7.23939 3.09273C6.15029 3.89909 5.34444 5.02956 4.93734 6.3221C4.53024 7.61463 4.5428 9.00286 4.97322 10.2878C5.40364 11.5728 6.22982 12.6885 7.33333 13.475V14.6667H14.6667V13.475C15.7702 12.6885 16.5964 11.5728 17.0268 10.2878C17.4572 9.00286 17.4698 7.61463 17.0627 6.3221C16.6556 5.02956 15.8497 3.89909 14.7606 3.09273C13.6715 2.28636 12.3551 1.8455 11 1.83333Z" />
      </>
    ),
  },
  navInicio: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <Path d="M2.75 10.0833L11 3.66667L19.25 10.0833V18.3333C19.25 18.5764 19.1534 18.8096 18.9815 18.9815C18.8096 19.1534 18.5764 19.25 18.3333 19.25H13.75V13.75H8.25V19.25H3.66667C3.42355 19.25 3.19039 19.1534 3.01849 18.9815C2.84658 18.8096 2.75 18.5764 2.75 18.3333V10.0833Z" />
    ),
  },
  navRegistrar: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <>
        <Path d="M19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z" />
        <Path d="M11 7.33333V14.6667" />
        <Path d="M7.33333 11H14.6667" />
      </>
    ),
  },
  navHistorico: {
    tamanho: 22,
    traco: 1.83333,
    render: () => (
      <>
        <Path d="M3.66667 18.3333V9.16667" />
        <Path d="M9.16667 18.3333V3.66667" />
        <Path d="M14.6667 18.3333V11.9167" />
        <Path d="M20.1667 18.3333H1.83333" />
      </>
    ),
  },
  navAjustes: {
    tamanho: 22,
    traco: 1.83333,
    render: (_cor, fundo) => (
      <>
        <Path d="M3.66667 5.5H18.3333" />
        <Path d="M3.66667 11H18.3333" />
        <Path d="M3.66667 16.5H18.3333" />
        <Path
          d="M8.25 7.33333C9.26252 7.33333 10.0833 6.51252 10.0833 5.5C10.0833 4.48748 9.26252 3.66667 8.25 3.66667C7.23748 3.66667 6.41667 4.48748 6.41667 5.5C6.41667 6.51252 7.23748 7.33333 8.25 7.33333Z"
          fill={fundo}
        />
        <Path
          d="M13.75 12.8333C14.7625 12.8333 15.5833 12.0125 15.5833 11C15.5833 9.98748 14.7625 9.16667 13.75 9.16667C12.7375 9.16667 11.9167 9.98748 11.9167 11C11.9167 12.0125 12.7375 12.8333 13.75 12.8333Z"
          fill={fundo}
        />
        <Path
          d="M6.41667 18.3333C7.42919 18.3333 8.25 17.5125 8.25 16.5C8.25 15.4875 7.42919 14.6667 6.41667 14.6667C5.40414 14.6667 4.58333 15.4875 4.58333 16.5C4.58333 17.5125 5.40414 18.3333 6.41667 18.3333Z"
          fill={fundo}
        />
      </>
    ),
  },
  // Sugestões de redução (RF08), do protótipo.
  rota: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M6.66667 15C6.66667 15.9205 5.92047 16.6667 5 16.6667C4.07953 16.6667 3.33333 15.9205 3.33333 15C3.33333 14.0795 4.07953 13.3333 5 13.3333C5.92047 13.3333 6.66667 14.0795 6.66667 15Z" />
        <Path d="M16.6667 5C16.6667 5.92047 15.9205 6.66667 15 6.66667C14.0795 6.66667 13.3333 5.92047 13.3333 5C13.3333 4.07953 14.0795 3.33333 15 3.33333C15.9205 3.33333 16.6667 4.07953 16.6667 5Z" />
        <Path d="M6.66667 15H12.5C13.163 15 13.7989 14.7366 14.2678 14.2678C14.7366 13.7989 15 13.163 15 12.5C15 11.837 14.7366 11.2011 14.2678 10.7322C13.7989 10.2634 13.163 10 12.5 10H7.5C6.83696 10 6.20107 9.73661 5.73223 9.26777C5.26339 8.79893 5 8.16304 5 7.5C5 6.83696 5.26339 6.20107 5.73223 5.73223C6.20107 5.26339 6.83696 5 7.5 5H13.3333" />
      </>
    ),
  },
  pessoas: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M10 6.66667C10 8.04738 8.88071 9.16667 7.5 9.16667C6.11929 9.16667 5 8.04738 5 6.66667C5 5.28596 6.11929 4.16667 7.5 4.16667C8.88071 4.16667 10 5.28596 10 6.66667Z" />
        <Path d="M2.5 16.6667V15.8333C2.5 14.7283 2.93899 13.6685 3.72039 12.8871C4.50179 12.1057 5.5616 11.6667 6.66667 11.6667H8.33333C9.4384 11.6667 10.4982 12.1057 11.2796 12.8871C12.061 13.6685 12.5 14.7283 12.5 15.8333V16.6667" />
        <Path d="M13.3333 4.16667C13.9964 4.16667 14.6323 4.43006 15.1011 4.8989C15.5699 5.36774 15.8333 6.00363 15.8333 6.66667C15.8333 7.32971 15.5699 7.96559 15.1011 8.43443C14.6323 8.90328 13.9964 9.16667 13.3333 9.16667" />
        <Path d="M15 11.6667C15.8002 12.0124 16.4718 12.6004 16.9203 13.3478C17.3687 14.0953 17.5715 14.9646 17.5 15.8333V16.6667" />
      </>
    ),
  },
  alvo: {
    tamanho: 20,
    traco: 1.66667,
    render: () => (
      <>
        <Path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" />
        <Path d="M13.3333 10C13.3333 11.8409 11.8409 13.3333 10 13.3333C8.15905 13.3333 6.66667 11.8409 6.66667 10C6.66667 8.15905 8.15905 6.66667 10 6.66667C11.8409 6.66667 13.3333 8.15905 13.3333 10Z" />
      </>
    ),
  },
  // Sugestões de redução que não existem no protótipo (desenho do Lucide).
  bicicleta: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <Path d="M18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <Path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        <Path d="M12 17.5V14l-3-3 4-3 2 3h2" />
      </>
    ),
  },
  folha: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </>
    ),
  },
  velocimetro: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="m12 14 4-4" />
        <Path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </>
    ),
  },
  ferramenta: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
      </>
    ),
  },
  gota: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
      </>
    ),
  },
  termometro: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      </>
    ),
  },
  geladeira: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
        <Path d="M5 10h14" />
        <Path d="M15 7v6" />
      </>
    ),
  },
  lampada: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <Path d="M9 18h6" />
        <Path d="M10 22h4" />
      </>
    ),
  },
  sol: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <Path d="M12 2v2" />
        <Path d="M12 20v2" />
        <Path d="m4.93 4.93 1.41 1.41" />
        <Path d="m17.66 17.66 1.41 1.41" />
        <Path d="M2 12h2" />
        <Path d="M20 12h2" />
        <Path d="m6.34 17.66-1.41 1.41" />
        <Path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
  },
  tomada: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M12 22v-5" />
        <Path d="M9 8V2" />
        <Path d="M15 8V2" />
        <Path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
      </>
    ),
  },
  panela: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M2 12h20" />
        <Path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
        <Path d="m4 8 16-4" />
        <Path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
      </>
    ),
  },
  // Lixeira que surge ao segurar um terreno. Não existe no protótipo (Lucide, "trash-2").
  lixeira: {
    tamanho: 28,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M3 6h18" />
        <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <Path d="M10 11v6" />
        <Path d="M14 11v6" />
      </>
    ),
  },
  chama: {
    tamanho: 20,
    caixa: 24,
    traco: 2,
    render: () => (
      <>
        <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
      </>
    ),
  },
};

type Props = {
  nome: NomeIcone;
  cor?: keyof Cores;
  // Cor sobre a qual o ícone é desenhado.
  fundo?: keyof Cores;
};

export function Icone({ nome, cor = 'marcaForte', fundo = 'superficie' }: Props) {
  const { cores } = useTema();
  const { tamanho, caixa = tamanho, traco, render } = desenhos[nome];
  const corTraco = cores[cor];

  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${caixa} ${caixa}`}
      fill="none"
      stroke={corTraco}
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {render(corTraco, cores[fundo])}
    </Svg>
  );
}
