const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Zajistíme, že adresář pro ikony existuje
const iconDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Zdrojový obrázek - použijeme jeden z vašich avatarů jako základ
// Můžete zaměnit za jakýkoliv jiný obrázek podle potřeby
const sourceImage = path.join(__dirname, 'public', 'assets', 'avatars', 'explorer.png');

// Velikosti ikon pro PWA (podle manifest.json)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Funkce pro generování ikon
async function generateIcons() {
  try {
    console.log('Generuji PWA ikony...');

    // Generování základních ikon
    for (const size of sizes) {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
      console.log(`✓ Vytvořena ikona: icon-${size}x${size}.png`);
    }

    // Generování ikon pro zkratky (map, achievement)
    await sharp(sourceImage)
      .resize(96, 96)
      .toFile(path.join(iconDir, 'map-icon-96x96.png'));
    console.log('✓ Vytvořena ikona: map-icon-96x96.png');

    await sharp(sourceImage)
      .resize(96, 96)
      .toFile(path.join(iconDir, 'achievement-icon-96x96.png'));
    console.log('✓ Vytvořena ikona: achievement-icon-96x96.png');

    // Favicon ikony
    await sharp(sourceImage)
      .resize(32, 32)
      .toFile(path.join(iconDir, 'favicon-32x32.png'));
    console.log('✓ Vytvořena ikona: favicon-32x32.png');

    await sharp(sourceImage)
      .resize(16, 16)
      .toFile(path.join(iconDir, 'favicon-16x16.png'));
    console.log('✓ Vytvořena ikona: favicon-16x16.png');

    // Vytvoření apple-touch-icon
    await sharp(sourceImage)
      .resize(180, 180)
      .toFile(path.join(iconDir, 'apple-touch-icon.png'));
    console.log('✓ Vytvořena ikona: apple-touch-icon.png');

    console.log('Generování ikon dokončeno!');

  } catch (error) {
    console.error('Chyba při generování ikon:', error);
  }
}

// Spustíme generování
generateIcons();