#!/bin/sh
# Gera os PNGs do ícone e da abertura nativa a partir dos SVGs desta pasta.
# Precisa do ImageMagick 7 (comando magick). Rode da raiz do projeto:
#   sh assets/icone/gerar.sh
set -e
origem=assets/icone
destino=assets/images
for nome in icon-ios-dark icon-ios-tinted android-icon-foreground android-icon-monochrome splash-icon splash-icon-dark; do
  magick -background none -density 96 "$origem/$nome.svg" -resize 1024x1024 "$destino/$nome.png"
done
# O iOS exige o ícone principal sem transparência.
magick -background none -density 96 "$origem/icon.svg" -resize 1024x1024 \
  -background '#0D1210' -alpha remove -alpha off "$destino/icon.png"
magick "$destino/icon.png" -resize 48x48 "$destino/favicon.png"
