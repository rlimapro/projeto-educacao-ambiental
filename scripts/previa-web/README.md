# Prévia web para conferir telas

O app é publicado só para Android e iOS, mas a versão web do Expo permite conferir uma tela contra o protótipo no Figma sem celular: abre no Chrome no tamanho do protótipo (390 × 844), nos dois temas, e salva capturas para comparar lado a lado.

## Como usar

Em um terminal:

```bash
npm run previa:web
```

Em outro, com o servidor já respondendo:

```bash
npm run previa:capturar -- /boas-vindas Continuar Continuar Continuar
```

A prévia usa a porta 8099, para poder rodar junto com o `npx expo start` do Expo Go (porta 8081). O primeiro argumento é a rota; os seguintes são os rótulos dos botões a tocar, um por captura. As imagens vão para `.previa/` (ignorada pelo git), uma por passo e por tema, e os avisos do console do navegador aparecem no terminal. Uma tela pronta não deixa nenhum aviso.

Para comparar com o Figma, coloque as capturas lado a lado com a imagem do protótipo. Com o ImageMagick:

```bash
montage figma.png .previa/boas-vindas-claro-1.png -tile 2x1 -geometry 390x844+8+8 comparacao.png
```

## Cuidados

- **Saída web `single`** no `app.json`: sem renderização no servidor. Com `server`, o SDK 58 acusa erro de hidratação na barra de abas (a largura da janela só existe no navegador). O app não é publicado na web, então não há o que perder.
- **Não use `CI=1`** no servidor: nesse modo o Metro não recarrega quando o código muda, e as capturas mostram a versão antiga.
- Na prévia, o armazenamento é uma simulação em memória (`armazenamento-memoria.js`): toda abertura é um primeiro uso. `?tema=escuro` na URL abre no tema escuro e `?boas-vindas=vistas` pula as boas-vindas. O script de captura usa os dois sozinho: fora de `/boas-vindas`, ele já abre a tela pedida.
- A prévia é aproximada: fontes e sombras podem variar alguns pixels em relação ao celular. Antes do pull request, confira também no Expo Go.
