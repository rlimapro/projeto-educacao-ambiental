import type { AjudaCampo } from './ajudaConsumo';

// Orientações da simulação de plantio (RF06), abertas em folhas de ajuda. São
// qualitativas: o tipo de árvore e o cuidado não mudam o número da tela, que é
// a taxa média do bioma (docs/simular-plantio.md, com as fontes).

export const AJUDA_TIPOS_DE_ARVORE: AjudaCampo = {
  chamada: 'Antes de plantar',
  titulo: 'Que árvores plantar',
  resumo:
    'Plante várias espécies nativas da sua região, misturadas. O cálculo já supõe essa mistura.',
  dicas: [
    'Pioneiras crescem rápido e fazem sombra nos primeiros anos.',
    'Não pioneiras crescem devagar e guardam carbono por mais tempo.',
    'As duas são necessárias, e a escolha entre elas não muda o número desta tela.',
    'Evite eucalipto e pinus: crescem rápido, mas costumam ser cortados cedo e não recuperam a mata.',
  ],
  exemplo:
    'Árvores de quintal e sistemas agroflorestais também guardam carbono, mas de outro jeito. O app ainda não calcula esses casos.',
};

export const AJUDA_CUIDADOS_DO_PLANTIO: AjudaCampo = {
  chamada: 'Antes de plantar',
  titulo: 'Como cuidar do plantio',
  resumo: 'As mudas precisam de cuidado nos primeiros 2 a 3 anos. Sem ele, muitas morrem.',
  dicas: [
    'Plante no começo da estação de chuvas.',
    'Mantenha limpo um círculo de cerca de 50 cm em volta de cada muda.',
    'Proteja do fogo com aceiros e cerque para o gado não entrar.',
    'Troque as mudas que morrerem.',
    'Não plante árvores em campos nativos, como os do Pampa e do Cerrado aberto.',
  ],
  exemplo: 'Para plantar na calçada, peça autorização à prefeitura.',
};
