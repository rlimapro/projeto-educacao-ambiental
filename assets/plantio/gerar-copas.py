# Gera a copa vista de cima (copa.svg) usada na distribuição de mudas. As sementes fixas mantêm o mesmo desenho a cada vez.
# Rode da raiz do projeto: python3 assets/plantio/gerar-copas.py
import math, sys, random
destino = sys.argv[1] if len(sys.argv) > 1 else "assets/plantio"
LUZ = math.radians(225)  # luz do alto, à esquerda; sombra para baixo, à direita
SOMBRA = LUZ - math.pi

def lobulo(rnd, cx, cy, r):
    return (cx, cy, r)

def crescente(cx, cy, r):
    # Arco de sombra no lado do grupo de folhas oposto à luz.
    rr = r * 0.8
    a1, a2 = SOMBRA - 0.75, SOMBRA + 0.75
    x1, y1 = cx + rr * math.cos(a1), cy + rr * math.sin(a1)
    x2, y2 = cx + rr * math.cos(a2), cy + rr * math.sin(a2)
    return f'<path d="M{x1:.1f} {y1:.1f} A{rr:.1f} {rr:.1f} 0 0 1 {x2:.1f} {y2:.1f}"/>'

def copa(semente, lobulos, raio_anel, raio_lobulo, internos):
    rnd = random.Random(semente)
    grupos = []
    giro = rnd.uniform(0, 2 * math.pi)
    for i in range(lobulos):
        ang = giro + 2 * math.pi * i / lobulos + rnd.uniform(-0.2, 0.2)
        d = raio_anel * rnd.uniform(0.85, 1.1)
        r = raio_lobulo * rnd.uniform(0.8, 1.15)
        grupos.append((50 + d * math.cos(ang), 50 + d * math.sin(ang), r))
    # Grupos de folhas por dentro, que dão volume ao meio da copa.
    for i in range(internos):
        ang = giro + 1.3 + 2 * math.pi * i / internos
        d = raio_anel * rnd.uniform(0.25, 0.45)
        r = raio_lobulo * rnd.uniform(0.8, 1.0)
        grupos.append((50 + d * math.cos(ang), 50 + d * math.sin(ang), r))
    corpo = ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}"/>' for x, y, r in grupos)
    miolo = f'<circle cx="50" cy="50" r="{raio_anel + 6:.1f}"/>'
    sombras = ''.join(crescente(x, y, r) for x, y, r in grupos)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Copa vista de cima, gerada por assets/plantio/gerar-copas.py. Branca e com
       transparência: o app a pinta com a cor do tema (tintColor, que troca a
       cor e mantém a transparência). Por isso a luz e as sombras estão na
       máscara: as partes mais transparentes (sombras entre os grupos de
       folhas, borda longe da luz) deixam ver o fundo. -->
  <defs>
    <radialGradient id="luz" gradientUnits="userSpaceOnUse" cx="40" cy="38" r="62">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="0.6" stop-color="#f0f0f0"/>
      <stop offset="1" stop-color="#b0b0b0"/>
    </radialGradient>
    <mask id="folhagem" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
      <g fill="url(#luz)">{corpo}{miolo}</g>
      <g fill="none" stroke="#8c8c8c" stroke-width="2" stroke-linecap="round">{sombras}</g>
    </mask>
  </defs>
  <rect width="100" height="100" fill="#fff" mask="url(#folhagem)"/>
</svg>
'''
# Das três variantes desenhadas, ficou a mais circular (contorno variando 5,5%
# em torno do raio médio, contra 6,1% e 8,6% das outras).
open(f'{destino}/copa.svg', 'w').write(copa(37, 10, 25, 19, 3))
