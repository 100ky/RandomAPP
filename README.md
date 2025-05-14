# Vysoké Mýto Úniková Hra

Tento projekt je mobilní aplikace vytvořená pomocí Next.js a TypeScriptu, která využívá MapLibre a geolokaci k vytvoření únikové venkovní hry ve Vysokém Mýtě.

## Funkce

- **Geolokace**: Aplikace využívá geolokaci zařízení pro sledování polohy hráče.
- **Interaktivní mapa**: Zobrazuje herní lokace a umožňuje hráčům interagovat s prostředím.
- **Herní prvky**: Obsahuje různé úkoly a hádanky, které musí hráči vyřešit.
- **Uživatelské rozhraní**: Poskytuje intuitivní ovládací prvky pro správu hry.
- **Offline režim**: Podpora pro ukládání mapových dlaždic pro použití bez internetu.
- **PWA**: Implementováno jako Progressive Web App s možností instalace.
- **Optimalizovaný zoom**: Implementace bezpečných limitů přiblížení s plynulými přechody.

## Technická dokumentace

Podrobná dokumentace ke konkrétním tématům:

- [Řešení problému s mapou při přiblížení](./src/docs/MAP-ZOOM-SOLUTION.md)
- [Optimalizace pro landscape režim](./src/docs/LANDSCAPE-OPTIMIZATION.md)
- [Průzkumnický design - Stylový průvodce](./src/docs/DESIGN-GUIDE.md)

## Instalace

1. Klonujte repozitář:
   ```
   git clone https://github.com/100ky/RandomAPP.git
   ```
2. Přejděte do adresáře projektu:
   ```
   cd RandomAPP/vymyto-unikova-hra
   ```
3. Nainstalujte závislosti:
   ```
   npm install
   ```
4. Spusťte aplikaci:
   ```
   npm run dev
   ```

## Použití

Aplikaci můžete spustit na mobilním zařízení nebo emulátoru. Ujistěte se, že máte povolenou geolokaci. Hráči mohou procházet mapou a plnit úkoly na různých herních lokalitách.

## Přispění

Pokud chcete přispět do projektu, vytvořte pull request nebo otevřete issue pro návrhy a chyby.

## Licencování

Tento projekt je licencován pod MIT licencí. Viz soubor [LICENSE](LICENSE) pro úplné znění.

### Licence třetích stran

Tento projekt používá různé open source knihovny, každá s vlastní licencí:

- **MapLibre GL JS** - BSD 3-Clause License
- **React, Next.js, React Map GL, Zustand, Next PWA** - MIT License
- **TypeScript** - Apache License 2.0
- **OpenStreetMap data** - Open Data Commons Open Database License (ODbL)

Podrobný seznam všech knihoven a jejich licencí najdete v souboru [NOTICE](NOTICE).

### Použití mapových podkladů

Aplikace používá mapové dlaždice z OpenStreetMap, které jsou zdarma pro běžné použití, ale mají určitá omezení:

- Je nutné dodržet [podmínky použití OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- Při větším provozu je doporučeno hostovat vlastní dlaždicové servery

### Publikování v app storech

Všechny použité knihovny jsou zdarma pro komerční využití a neobsahují žádné licenční poplatky. Pro publikování aplikace v obchodech s aplikacemi je však potřeba:

- **Google Play Store**: Vývojářský účet ($25 jednorázově)
- **Apple App Store**: Vývojářský účet ($99 ročně)

#### Převod PWA do nativních aplikací

Pro Android:

```bash
# Pomocí Bubblewrap (zdarma)
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://vase-domena.cz/manifest.json
bubblewrap build
```

Pro iOS:

```bash
# Pomocí Capacitoru (zdarma)
npm install @capacitor/cli @capacitor/core
npx cap init VymytoApp com.vasedomena.vymyto
npm install @capacitor/ios
npx cap add ios
npx cap open ios
```

## Kontakt

Pro více informací kontaktujte vývojový tým na [email@example.com](mailto:email@example.com).
