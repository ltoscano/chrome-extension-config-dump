#!/usr/bin/env python3
"""
Script per generare icone PNG per l'estensione Chrome.
Richiede: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Errore: Pillow non installato")
    print("Installa con: pip install Pillow")
    exit(1)

def create_icon(size):
    """Crea un'icona semplice con un cookie e una freccia di download"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Sfondo blu
    margin = size // 10
    draw.rounded_rectangle(
        [(margin, margin), (size - margin, size - margin)],
        radius=size // 8,
        fill='#1a73e8'
    )

    # Cookie (cerchio bianco)
    cookie_y = size // 3
    cookie_radius = size // 5
    draw.ellipse(
        [(size // 2 - cookie_radius, cookie_y - cookie_radius),
         (size // 2 + cookie_radius, cookie_y + cookie_radius)],
        fill='white'
    )

    # Punti nel cookie
    dot_size = max(2, size // 30)
    dots = [
        (size // 2 - cookie_radius // 2, cookie_y - cookie_radius // 3),
        (size // 2 + cookie_radius // 3, cookie_y),
        (size // 2 - cookie_radius // 3, cookie_y + cookie_radius // 3),
        (size // 2 + cookie_radius // 3, cookie_y + cookie_radius // 2),
    ]
    for x, y in dots:
        draw.ellipse([(x - dot_size, y - dot_size), (x + dot_size, y + dot_size)], fill='#1a73e8')

    # Freccia download (semplificata)
    arrow_y = size * 2 // 3 + size // 10
    arrow_width = size // 15
    arrow_head = size // 6

    # Linea verticale
    draw.rectangle(
        [(size // 2 - arrow_width, arrow_y - arrow_head * 2),
         (size // 2 + arrow_width, arrow_y)],
        fill='white'
    )

    # Punta freccia
    draw.polygon(
        [(size // 2, arrow_y + arrow_head),
         (size // 2 - arrow_head, arrow_y - arrow_width),
         (size // 2 + arrow_head, arrow_y - arrow_width)],
        fill='white'
    )

    # Linea base
    base_y = arrow_y + arrow_head + arrow_width * 2
    draw.rectangle(
        [(size // 3, base_y - arrow_width),
         (size * 2 // 3, base_y + arrow_width)],
        fill='white'
    )

    return img

def main():
    sizes = [16, 48, 128]

    for size in sizes:
        icon = create_icon(size)
        filename = f'icons/icon{size}.png'
        icon.save(filename, 'PNG')
        print(f'✓ Creato {filename}')

    print('\nIcone generate con successo!')

if __name__ == '__main__':
    main()
