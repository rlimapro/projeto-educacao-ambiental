import type {
  EmissaoFonte,
  FonteEmissaoId,
  GrupoComSugestoes,
  GrupoFonte,
  ImpactoSugestao,
  Perfil,
  SugestaoReducao,
} from './tipos';

// Catálogo de sugestões de redução (RF08), embutido no app para funcionar sem
// internet. Critérios de impacto e de escolha em docs/sugestoes-reducao.md.
// Nenhuma sugestão promete uma quantidade de kg: o único número mostrado ao
// usuário é derivado do próprio cálculo do mês (emissaoEvitadaKgCo2e).

const todos: Perfil[] = ['pessoa', 'residencia', 'comercio'];
const casa: Perfil[] = ['pessoa', 'residencia'];

// nomeCurto vai nos botões de escolha do grupo; comArtigo, no meio de frases
// ("Sugestões para o combustível").
export const GRUPOS_FONTE: Record<
  GrupoFonte,
  { nome: string; nomeCurto: string; comArtigo: string; fontes: FonteEmissaoId[] }
> = {
  combustivel: {
    nome: 'Combustível',
    nomeCurto: 'Combustível',
    comArtigo: 'o combustível',
    fontes: ['gasolina', 'etanol', 'diesel'],
  },
  energia: {
    nome: 'Energia elétrica',
    nomeCurto: 'Energia',
    comArtigo: 'a energia elétrica',
    fontes: ['energia'],
  },
  gas: { nome: 'Gás de cozinha', nomeCurto: 'Gás', comArtigo: 'o gás de cozinha', fontes: ['glp'] },
};

export const SUGESTOES_REDUCAO: SugestaoReducao[] = [
  // Combustível
  {
    id: 'combine-trajetos',
    grupo: 'combustivel',
    titulo: 'Combine trajetos',
    descricao: 'Junte compras e compromissos numa mesma saída para rodar menos.',
    impacto: 'alto',
    icone: 'rota',
    perfis: casa,
  },
  {
    id: 'entregas-por-regiao',
    grupo: 'combustivel',
    titulo: 'Planeje entregas por região',
    descricao: 'Agrupe entregas e visitas próximas numa mesma rota.',
    impacto: 'alto',
    icone: 'rota',
    perfis: ['comercio'],
  },
  {
    id: 'divida-o-carro',
    grupo: 'combustivel',
    titulo: 'Divida o carro',
    descricao: 'Uma carona com mais pessoas divide a emissão do mesmo trajeto.',
    impacto: 'alto',
    icone: 'pessoas',
    perfis: casa,
  },
  {
    id: 'etanol-no-flex',
    grupo: 'combustivel',
    titulo: 'Prefira etanol no carro flex',
    descricao: 'Pelos fatores usados no app, o litro de etanol emite bem menos que o de gasolina.',
    impacto: 'alto',
    icone: 'folha',
    perfis: todos,
    exigeFonte: ['gasolina'],
  },
  {
    id: 'trajetos-curtos',
    grupo: 'combustivel',
    titulo: 'Vá a pé ou de bicicleta',
    descricao: 'Em trajetos curtos, deixar o carro em casa evita toda a emissão do percurso.',
    impacto: 'medio',
    icone: 'bicicleta',
    perfis: casa,
  },
  {
    id: 'direcao-suave',
    grupo: 'combustivel',
    titulo: 'Dirija com suavidade',
    descricao: 'Acelere e freie com calma e mantenha a velocidade constante.',
    impacto: 'medio',
    icone: 'velocimetro',
    perfis: todos,
  },
  {
    id: 'calibre-os-pneus',
    grupo: 'combustivel',
    titulo: 'Calibre os pneus',
    descricao: 'Pneus com pressão baixa aumentam o consumo de combustível.',
    impacto: 'medio',
    icone: 'alvo',
    perfis: todos,
  },
  {
    id: 'revisao-em-dia',
    grupo: 'combustivel',
    titulo: 'Faça a revisão em dia',
    descricao: 'Motor regulado e filtros limpos gastam menos combustível.',
    impacto: 'baixo',
    icone: 'ferramenta',
    perfis: todos,
  },

  // Energia elétrica
  {
    id: 'banho-mais-curto',
    grupo: 'energia',
    titulo: 'Encurte o banho',
    descricao: 'O chuveiro elétrico é um dos aparelhos que mais gastam energia em casa.',
    impacto: 'alto',
    icone: 'gota',
    perfis: casa,
  },
  {
    id: 'ar-condicionado',
    grupo: 'energia',
    titulo: 'Ajuste o ar-condicionado',
    descricao: 'Evite temperaturas muito baixas e mantenha portas e janelas fechadas.',
    impacto: 'alto',
    icone: 'termometro',
    perfis: todos,
  },
  {
    id: 'desligue-ao-fechar',
    grupo: 'energia',
    titulo: 'Desligue tudo ao fechar',
    descricao: 'Luzes, vitrines e aparelhos ligados fora do expediente gastam sem atender ninguém.',
    impacto: 'alto',
    icone: 'tomada',
    perfis: ['comercio'],
  },
  {
    id: 'geladeira',
    grupo: 'energia',
    titulo: 'Cuide da geladeira',
    descricao: 'Abra só quando precisar, não guarde comida quente e confira a borracha da porta.',
    impacto: 'medio',
    icone: 'geladeira',
    perfis: todos,
  },
  {
    id: 'lampadas-led',
    grupo: 'energia',
    titulo: 'Troque por lâmpadas LED',
    descricao: 'Elas gastam bem menos energia para iluminar o mesmo ambiente.',
    impacto: 'medio',
    icone: 'lampada',
    perfis: todos,
  },
  {
    id: 'luz-do-dia',
    grupo: 'energia',
    titulo: 'Aproveite a luz do dia',
    descricao: 'Abra cortinas e janelas antes de acender as lâmpadas.',
    impacto: 'baixo',
    icone: 'sol',
    perfis: todos,
  },
  {
    id: 'tire-da-tomada',
    grupo: 'energia',
    titulo: 'Tire da tomada',
    descricao: 'Aparelhos em espera continuam gastando um pouco de energia.',
    impacto: 'baixo',
    icone: 'tomada',
    perfis: casa,
  },

  // Gás de cozinha
  {
    id: 'panela-de-pressao',
    grupo: 'gas',
    titulo: 'Use a panela de pressão',
    descricao: 'Feijão, carnes e grãos ficam prontos em bem menos tempo.',
    impacto: 'alto',
    icone: 'panela',
    perfis: todos,
  },
  {
    id: 'tampe-as-panelas',
    grupo: 'gas',
    titulo: 'Tampe as panelas',
    descricao: 'Com a tampa, a comida esquenta mais rápido e gasta menos gás.',
    impacto: 'medio',
    icone: 'panela',
    perfis: todos,
  },
  {
    id: 'ajuste-a-chama',
    grupo: 'gas',
    titulo: 'Ajuste a chama',
    descricao: 'A chama não deve passar do fundo da panela.',
    impacto: 'medio',
    icone: 'chama',
    perfis: todos,
  },
  {
    id: 'graos-de-molho',
    grupo: 'gas',
    titulo: 'Deixe os grãos de molho',
    descricao: 'Feijão e grão-de-bico hidratados antes cozinham mais rápido.',
    impacto: 'baixo',
    icone: 'gota',
    perfis: todos,
  },
  {
    id: 'limpe-os-queimadores',
    grupo: 'gas',
    titulo: 'Limpe os queimadores',
    descricao: 'Uma chama azul e uniforme aproveita melhor o gás.',
    impacto: 'baixo',
    icone: 'chama',
    perfis: todos,
  },
];

const ordemImpacto: Record<ImpactoSugestao, number> = { alto: 0, medio: 1, baixo: 2 };

function grupoDaFonte(id: string): GrupoFonte | undefined {
  return (Object.keys(GRUPOS_FONTE) as GrupoFonte[]).find((grupo) =>
    (GRUPOS_FONTE[grupo].fontes as string[]).includes(id),
  );
}

// Agrupa as fontes do mês, do grupo que mais emite para o que menos emite, e
// escolhe as sugestões de cada grupo para o perfil. Grupos sem emissão ficam
// de fora. Dentro do grupo, as sugestões vão da de maior impacto para a de
// menor, mantendo a ordem do catálogo entre as de mesmo impacto.
export function agruparSugestoes(
  fontes: EmissaoFonte[],
  perfil: Perfil,
  catalogo: SugestaoReducao[] = SUGESTOES_REDUCAO,
): GrupoComSugestoes[] {
  const totalKgCo2e = fontes.reduce((soma, fonte) => soma + fonte.emissaoKgCo2e, 0);
  if (totalKgCo2e <= 0) return [];

  const fontesComEmissao = new Set(fontes.filter((f) => f.emissaoKgCo2e > 0).map((f) => f.id));
  const emissaoPorGrupo = new Map<GrupoFonte, number>();
  for (const fonte of fontes) {
    const grupo = grupoDaFonte(fonte.id);
    if (!grupo) continue;
    emissaoPorGrupo.set(grupo, (emissaoPorGrupo.get(grupo) ?? 0) + fonte.emissaoKgCo2e);
  }

  return [...emissaoPorGrupo.entries()]
    .filter(([, emissao]) => emissao > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([grupo, emissaoKgCo2e]) => ({
      grupo,
      nome: GRUPOS_FONTE[grupo].nome,
      emissaoKgCo2e,
      fracao: emissaoKgCo2e / totalKgCo2e,
      sugestoes: catalogo
        .filter(
          (s) =>
            s.grupo === grupo &&
            s.perfis.includes(perfil) &&
            (!s.exigeFonte || s.exigeFonte.some((id) => fontesComEmissao.has(id))),
        )
        .map((s, ordem) => ({ s, ordem }))
        .sort((a, b) => ordemImpacto[a.s.impacto] - ordemImpacto[b.s.impacto] || a.ordem - b.ordem)
        .map(({ s }) => s),
    }));
}

// Grupo ao qual uma fonte pertence, para abrir as sugestões a partir da
// memória de cálculo de uma fonte.
export function grupoDeFonte(id: string): GrupoFonte {
  const grupo = grupoDaFonte(id);
  if (!grupo) throw new Error(`Fonte sem grupo de sugestões: ${id}`);
  return grupo;
}

// Quanto deixaria de ser emitido reduzindo uma fração do consumo. As emissões
// são proporcionais ao consumo (consumo × fator), então reduzir 10% do consumo
// reduz 10% da emissão.
export function emissaoEvitadaKgCo2e(emissaoKgCo2e: number, fracaoReducao: number): number {
  if (!Number.isFinite(emissaoKgCo2e) || emissaoKgCo2e < 0) {
    throw new Error('A emissão precisa ser um número finito igual ou maior que zero');
  }
  if (!Number.isFinite(fracaoReducao) || fracaoReducao < 0 || fracaoReducao > 1) {
    throw new Error('A redução precisa ser uma fração entre 0 e 1');
  }
  return emissaoKgCo2e * fracaoReducao;
}
