---
name: privacidade-e-seguranca
description: Regras de privacidade e segurança do app, que promete ao usuário que nenhum dado sai do aparelho. Use sempre que adicionar ou atualizar uma dependência, escrever código de armazenamento, backup, importação de arquivos, permissões, logs ou configuração do app.json, e ao revisar um pull request, mesmo que a tarefa não mencione privacidade.
---

# Privacidade e segurança

## A promessa

A primeira tela do app diz ao usuário que os dados ficam só no aparelho, que não há conta e que nada é compartilhado. Esta skill existe para que essa frase continue verdadeira. Os dados de consumo de uma casa revelam hábitos, horários e renda; tratá-los como sensíveis é uma exigência da LGPD e do próprio propósito do app.

## Rede

- Nenhuma chamada de rede no código do app: nada de `fetch`, `axios`, `XMLHttpRequest`, `WebSocket` ou equivalentes.
- Não configure atualizações remotas (OTA). Novos fatores chegam em novas versões do app.
- O servidor de desenvolvimento do Expo usa a rede durante o desenvolvimento; isso não faz parte do app publicado e é aceitável.

Para auditar:

```bash
grep -rnE "fetch\(|axios|XMLHttpRequest|WebSocket" src
```

O resultado esperado é vazio.

## Dependências

Antes de adicionar um pacote, verifique:

1. Ele faz chamadas de rede? Leia a descrição e o código de inicialização. SDKs de analytics, anúncios, relatório de erros (Sentry, Firebase Analytics, Crashlytics e similares) e configuração remota estão proibidos.
2. Ele pede permissões? Se pedir algo que o app não usa, não adicione.
3. Ele é realmente necessário? Cada dependência é código de terceiros rodando com os dados do usuário.

Justifique toda dependência nova no pull request.

## Permissões

O app não precisa de localização, contatos, câmera, microfone nem notificações. O acesso a arquivos acontece apenas pelo seletor de documentos e pelo menu de compartilhamento do sistema, que já pedem consentimento ao usuário a cada uso.

## Logs

- Nunca registre consumos, emissões ou conteúdo de backup em `console.log`.
- Logs de depuração só em desenvolvimento, protegidos por `if (__DEV__)`.

## Backup

Exportar (RF09):

- O arquivo contém apenas dados do app, em JSON, com um campo `versaoFormato`.
- Ele só é gerado por ação explícita do usuário, e o destino é escolhido pelo usuário no menu de compartilhamento.

Importar (RF10) — trate o arquivo como entrada não confiável:

- Valide a estrutura inteira antes de gravar qualquer coisa: campos obrigatórios, tipos, números finitos e não negativos.
- Recuse `versaoFormato` desconhecida com uma mensagem clara.
- Limite o tamanho do arquivo aceito.
- Grave tudo numa transação: ou importa completo, ou não altera nada.
- Nunca execute nem interprete conteúdo do arquivo como código.

## Apagar dados

Ajustes deve oferecer "Apagar todos os meus dados", com confirmação. Isso cumpre o direito de eliminação da LGPD e é a contrapartida natural de guardar tudo localmente.

## Checklist de revisão

- [ ] Nenhuma chamada de rede nova.
- [ ] Nenhuma dependência nova sem justificativa.
- [ ] Nenhuma permissão nova no `app.json`.
- [ ] Nenhum dado do usuário em logs.
- [ ] Importação valida antes de gravar e usa transação.
