import { SvgXml } from 'react-native-svg';

import { useTema, type Cores } from './tema';

type FonteIcone = 'energia' | 'combustivel' | 'gas' | 'adicionar';

const svgs: Record<FonteIcone, string> = {
  energia: '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Ícone · Energia elétrica"><path id="Vector" d="M9.75 1.5L3 10.5H8.25L7.5 16.5L14.25 7.5H9L9.75 1.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/></g></svg>',
  combustivel: '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Ícone · Gasolina"><path id="Vector" d="M3.75 12.75H2.25V9L3.75 5.25H14.25L15.75 9V12.75H14.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/><path id="Vector_2" d="M6.75 12.75H11.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/><path id="Vector_3" d="M2.25 9H15.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/><path id="Vector_4" d="M6.75 12.75C6.75 13.5784 6.07843 14.25 5.25 14.25C4.42157 14.25 3.75 13.5784 3.75 12.75C3.75 11.9216 4.42157 11.25 5.25 11.25C6.07843 11.25 6.75 11.9216 6.75 12.75Z" stroke-width="1.5" stroke="#3D6B0F"/><path id="Vector_5" d="M14.25 12.75C14.25 13.5784 13.5784 14.25 12.75 14.25C11.9216 14.25 11.25 13.5784 11.25 12.75C11.25 11.9216 11.9216 11.25 12.75 11.25C13.5784 11.25 14.25 11.9216 14.25 12.75Z" stroke-width="1.5" stroke="#3D6B0F"/></g></svg>',
  gas: '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Ícone · Gás de cozinha"><path id="Vector" d="M9 16.5C12 16.5 14.25 14.25 14.25 11.25C14.25 8.25 12 6.75 11.25 3.75C9.75 5.25 9 6.75 9 8.25C8.25 7.5 7.5 6.75 7.5 5.25C6 6.75 3.75 9 3.75 11.25C3.75 14.25 6 16.5 9 16.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/></g></svg>',
  adicionar: '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Ícone · Adicionar"><path id="Vector" d="M10 4.16667V15.8333" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/><path id="Vector_2" d="M4.16667 10H15.8333" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" stroke="#3D6B0F"/></g></svg>',
};

type Props = { nome: FonteIcone; cor?: keyof Cores };

export function IconeConsumo({ nome, cor = 'marcaForte' }: Props) {
  const { cores } = useTema();
  return <SvgXml xml={svgs[nome].replaceAll('#3D6B0F', cores[cor])} aria-hidden />;
}
