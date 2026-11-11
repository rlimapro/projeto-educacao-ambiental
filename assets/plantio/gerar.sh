#!/bin/sh
# Gera o PNG da copa a partir do SVG desta pasta. Um arquivo só, de 192 px:
# cobre a maior copa numa tela 3× (96 × 64 pontos por muda, copa de 51 pontos,
# 153 px), e o aparelho o reduz nos tamanhos menores. Precisa do ImageMagick 7
# (comando magick) com o librsvg. Rode da raiz do projeto:
#   python3 assets/plantio/gerar-copas.py && sh assets/plantio/gerar.sh
set -e
magick -background none -density 384 assets/plantio/copa.svg -resize 192x192 \
  -strip -colorspace Gray -depth 8 -define png:compression-level=9 assets/images/copa.png
