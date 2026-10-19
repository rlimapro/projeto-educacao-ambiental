# App de Emissões (nome provisório)

Aplicativo móvel para Android e iOS que ajuda pessoas e pequenos comércios a calcular suas emissões de gases de efeito estufa e a entender quanto plantio de árvores seria necessário para neutralizá-las.

Tudo funciona offline. Os dados ficam apenas no celular do usuário: não há conta, servidor nem compartilhamento automático.

Projeto da disciplina de Educação Ambiental da UFC Quixadá, em parceria com o IFCE.

## Equipe

- José Rian Mendes Lima
- Renan Alencar Soares
- Francisco Samuel Cabral Leitão

## Como rodar

Pré-requisitos: Node.js em versão LTS e o aplicativo Expo Go instalado no celular.

```bash
git clone <url-do-repositorio>
cd app-emissoes
npm install
npx expo start
```

Escaneie o QR code com a câmera (iOS) ou com o Expo Go (Android). O celular e o computador precisam estar na mesma rede.

Testes e verificação de tipos:

```bash
npm test
npx tsc --noEmit
```

## Como contribuir

Nenhuma alteração vai direto para a `main`. Todo código entra por pull request, revisado por outra pessoa da equipe.

1. Crie uma branch a partir da `main` atualizada.
2. Implemente seguindo o `AGENTS.md`, que vale tanto para pessoas quanto para agentes de código.
3. Faça commits no padrão descrito abaixo.
4. Abra um pull request e peça revisão.
5. Depois de aprovado, faça o merge e apague a branch.

### Nomes de branch

`<tipo>/<descrição-curta>`, com o mesmo `tipo` dos commits e o requisito quando houver:

```
feat/rf03-calculo-emissoes
fix/arredondamento-arvores
docs/fatores-energia
```

### Mensagens de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com a descrição em português:

```
<tipo>(<escopo>): <descrição>
```

| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de um erro |
| `docs` | Apenas documentação |
| `test` | Criação ou ajuste de testes, sem mudar o código do app |
| `refactor` | Mudança de código que não altera o comportamento |
| `style` | Formatação, sem mudança de lógica |
| `chore` | Configuração, dependências, scripts |

O escopo é opcional e indica a área afetada: `calculo`, `dados`, `ui`, `telas`, `backup`, `tema`.

Regras:

- Descrição no presente, começando com letra minúscula e sem ponto final: "adiciona", não "adicionado" nem "Adicionando".
- Até 72 caracteres na primeira linha. Se precisar explicar mais, pule uma linha e escreva no corpo.
- Cite o requisito entre parênteses quando o commit implementar um.
- Um commit por mudança coerente. "Ajustes diversos" não diz nada a quem revisa.

Exemplos:

```
feat(calculo): adiciona fonte GLP (RF02)
fix(calculo): arredonda árvores sempre para cima (RF05)
test(dados): cobre importação de backup com versão desconhecida
docs: registra fator de energia elétrica com fonte e ano
chore: adiciona react-native-svg
```

### Pull requests

**Todo pull request precisa da aprovação de pelo menos uma pessoa da equipe que não seja o autor** antes do merge. Ninguém aprova o próprio PR.

Ao abrir o PR, a descrição deve conter:

- O que mudou e por quê, em poucas linhas.
- O requisito atendido (RF ou RNF), quando houver.
- Como testar: os passos para ver a mudança funcionando no Expo Go.
- Capturas de tela nos temas claro e escuro, se a mudança for visual. A prévia web gera essas capturas com um comando (`scripts/previa-web/README.md`).

Antes de pedir revisão, confirme que `npx tsc --noEmit` e `npm test` passam.

Quem revisa confere:

- Se o requisito foi atendido de fato, testando no celular quando houver mudança visual.
- Se há testes para o que mudou em `src/calculo/` e `src/dados/`.
- Se as regras do `AGENTS.md` foram respeitadas: nenhuma chamada de rede, nenhum fator sem fonte, nenhuma cor fora do tema.
- Se o código é compreensível para quem não o escreveu.

**Código gerado por agente é revisado como qualquer outro.** Quem abre o PR responde pelo conteúdo, tenha escrito à mão ou não. Se não souber explicar um trecho, ele ainda não está pronto para revisão.

O merge é feito com **Squash and merge**, usando como título do commit final um título no padrão Conventional Commits. Assim, a `main` fica com um commit legível por PR.

## Documentação

- `docs/requisitos.md`: o que o app precisa fazer.
- `docs/metodologia-calculo.md`: como as emissões e as árvores são calculadas, com fatores e fontes.
- `docs/design.md`: cores, tipografia e componentes do estilo visual.
- `docs/iso/`: cópias locais da ISO 14064. Cada membro mantém a sua; os arquivos não são versionados porque a licença da norma não permite redistribuição.

## Desenvolvimento assistido por agentes

As regras gerais ficam em `AGENTS.md`, lido por Claude Code, Codex, Cursor, Copilot e outras ferramentas. Procedimentos específicos ficam em `.agents/skills/`. A pasta `.claude/skills` é um link simbólico para `.agents/skills`, para que o Claude Code também encontre as skills.
