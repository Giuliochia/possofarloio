const sharp = require('sharp');

async function main() {
  const { data, info } = await sharp('logo.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const isOrange = r > 170 && g > 50 && g < 180 && b < 80;
    const brightness = (r + g + b) / 3;
    const isBackground = brightness > 180 && !isOrange;

    if (isBackground) {
      // sfondo bianco → trasparente
      data[idx + 3] = 0;
    } else if (isOrange) {
      // arancio → mantieni colore, opaco
      data[idx + 3] = 255;
    } else {
      // testo/icone scuri → bianco puro opaco
      data[idx]     = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('logo-dark.png');

  console.log('logo-dark.png generato con sharp');
}

main().catch(console.error);
