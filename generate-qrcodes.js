// Nástroj pro generování QR kódů pro lokace ve hře
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Definice lokací s QR kódy 
// Místo parsování souboru použijeme pevně definované hodnoty
const puzzleLocations = [
  {
    id: 'namesti',
    name: "Náměstí Přemysla Otakara II",
    qrCode: 'vymyto_namesti_1',
  },
  {
    id: 'chramsvvavrince',
    name: "Chrám sv. Vavřince",
    qrCode: 'vymyto_chram_1',
  },
  {
    id: 'mestskebranky',
    name: "Pražská (Litomyšlská) brána",
    qrCode: 'vymyto_brana_1',
  },
  {
    id: 'regionalnimuzeum',
    name: "Regionální muzeum",
    qrCode: 'vymyto_muzeum_1',
  },
  {
    id: 'vodarnaves',
    name: "Pražská vodárenská věž",
    qrCode: 'vymyto_vodarna_1',
  }
];

console.log(`Použito ${puzzleLocations.length} definovaných lokací pro generování QR kódů`);
puzzleLocations.forEach(loc => {
  console.log(`Lokace "${loc.name}" (${loc.id}): QR kód = ${loc.qrCode}`);
});

// Adresář pro ukládání QR kódů
const QR_CODES_DIR = path.join(__dirname, 'public', 'assets', 'qrcodes');

// Vytvoření adresáře, pokud neexistuje
if (!fs.existsSync(QR_CODES_DIR)) {
  fs.mkdirSync(QR_CODES_DIR, { recursive: true });
}

// Async funkce pro generování QR kódů
async function generateQRCodes() {
  console.log('Generování QR kódů pro lokace...');

  // Pro každou lokaci s QR kódem vygenerovat QR kód
  for (const location of puzzleLocations) {
    if (location.qrCode) {
      try {
        const qrCodePath = path.join(QR_CODES_DIR, `${location.id}.png`);
        
        // Vygenerovat QR kód jako PNG soubor
        await QRCode.toFile(qrCodePath, location.qrCode, {
          color: {
            dark: '#000',  // Barva QR kódu
            light: '#FFF'  // Barva pozadí
          },
          errorCorrectionLevel: 'M', // Medium úroveň korekce chyb
          margin: 4, // Okraj kolem QR kódu (v modulech)
          scale: 8, // Velikost QR kódu
        });
        
        console.log(`Vygenerován QR kód pro lokaci "${location.name}" (${location.id}.png)`);
      } catch (err) {
        console.error(`Chyba při generování QR kódu pro lokaci "${location.name}":`, err);
      }
    }
  }
  
  // Generovat také QR kódy s obsahem ID lokace pro snazší testování
  for (const location of puzzleLocations) {
    try {
      const qrCodePath = path.join(QR_CODES_DIR, `${location.id}_test.png`);
      
      // Vygenerovat QR kód s ID lokace jako PNG soubor
      await QRCode.toFile(qrCodePath, location.id, {
        color: {
          dark: '#000',
          light: '#FFF'
        },
        errorCorrectionLevel: 'M',
        margin: 4,
        scale: 8,
      });
      
      console.log(`Vygenerován testovací QR kód pro lokaci "${location.name}" (${location.id}_test.png)`);
    } catch (err) {
      console.error(`Chyba při generování testovacího QR kódu pro lokaci "${location.name}":`, err);
    }
  }
  
  console.log('Generování QR kódů dokončeno!');
  console.log(`QR kódy byly uloženy do adresáře: ${QR_CODES_DIR}`);
  console.log('Můžete je vytisknout a umístit na příslušné lokace.');
}

// Spustit generování QR kódů
generateQRCodes();
