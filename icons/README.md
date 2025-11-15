# Icone dell'estensione

Questa directory contiene le icone per l'estensione Chrome.

## Generare le icone PNG

Per generare le icone PNG dalle icone SVG, puoi usare uno dei seguenti metodi:

### Metodo 1: Usando ImageMagick (consigliato)

```bash
# Installa ImageMagick se non già installato
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick

# Genera le icone
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### Metodo 2: Usando uno strumento online

Visita uno dei seguenti siti per convertire l'SVG in PNG:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

Genera le icone nelle seguenti dimensioni:
- 16x16px (icon16.png)
- 48x48px (icon48.png)
- 128x128px (icon128.png)

### Metodo 3: Usa le tue icone personalizzate

Puoi sostituire il file `icon.svg` con le tue icone personalizzate e seguire gli stessi passaggi sopra.

## File richiesti

L'estensione richiede i seguenti file PNG in questa directory:
- `icon16.png` - Icona piccola (16x16px)
- `icon48.png` - Icona media (48x48px)
- `icon128.png` - Icona grande (128x128px)
