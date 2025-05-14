# Řešení problému s mizením mapy při přiblížení

Tento dokument popisuje implementované řešení problému, kdy mapa v aplikaci mizela při velkém přiblížení. Řešení zahrnuje jak technické změny, tak vylepšení uživatelského rozhraní.

## 1. Technické řešení

### 1.1 Omezení úrovní zoomu

V souboru `/src/utils/mapZoomConstraints.ts` jsou definovány konstanty a pomocné funkce:

- `MIN_ZOOM` (5) a `MAX_ZOOM` (18) - pevné limity pro přiblížení mapy
- `constrainZoom()` - funkce pro kontrolu, že zoom je v bezpečném rozmezí
- `setupZoomConstraints()` - nastavuje limity přímo na instanci mapy
- `smoothZoom()` - plynulé animace přiblížení

### 1.2 Aplikace limitů v Map.tsx

Limity jsou aplikovány několika způsoby:

1. Při inicializaci mapy:

```typescript
mapRef.current = new maplibre.Map({
  // Další nastavení...
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  scrollZoom: {
    around: "center",
  },
});
```

2. Při každé změně zoomu:

```typescript
mapRef.current.on("zoom", () => {
  if (mapRef.current) {
    const zoom = mapRef.current.getZoom();
    setCurrentZoom(zoom);

    // Korekce hodnoty zoomu pokud je mimo povolený rozsah
    if (zoom > MAX_ZOOM) {
      mapRef.current.setZoom(MAX_ZOOM);
    } else if (zoom < MIN_ZOOM) {
      mapRef.current.setZoom(MIN_ZOOM);
    }
  }
});
```

3. Funkce `ensureSafeZoom()` pro bezpečnostní kontrolu po všech animacích

## 2. Vylepšení uživatelské zkušenosti

Pro lepší orientaci uživatele jsme implementovali:

### 2.1 Vizuální upozornění

- Upozornění při dosažení maximálního/minimálního zoomu pomocí `.maxZoomAlert` a `.minZoomAlert`
- Animované přechody s využitím `fadeInOut` animace
- Indikátor přiblížení v nastavení mapy:
  - Ukazuje aktuální úroveň přiblížení
  - Mění barvu na oranžovou, když se blíží maximu (> 85%)

### 2.2 Ovládací prvky

- Tlačítka pro ovládání zoomu přímo v mapě (`mapZoomControls`)
- Tlačítka v menu nastavení (`zoomControls`)
- Použití `smoothZoom()` pro plynulejší změny přiblížení

### 2.3 Vizuální efekty

- Pulzní efekt při centrování na uživatele (`locationPulse`)
- Animace varování při dosažení limitů zoomu

## 3. Proces testování

Pro zajištění správné funkčnosti by měly být otestovány tyto scénáře:

1. Přiblížení na maximální úroveň zoomu pomocí:

   - Kolečka myši
   - Dvouklikem
   - Tlačítky pro ovládání zoomu
   - Gesty na mobilních zařízeních

2. Oddálení na minimální úroveň zoomu

3. Kombinace s ostatními akcemi:
   - Centrování na uživatele při maximálním přiblížení
   - Přiblížení během animace pohybu

## 4. Známé limitace

- Maximální zoom je nastaven na hodnotu 18, což je nižší než teoretické maximum vrstvy (19), ale zabraňuje to mizení mapy
- Při velmi rychlých změnách zoomu může dojít ke krátkému překročení limitů, ale je okamžitě opraveno

## 5. Další vylepšení

Možná vylepšení do budoucna:

- Adaptivní maximální zoom podle dostupnosti mapových dlaždic
- Přechod na vektorové mapy místo rastrových pro lepší škálování
- Přidání tutoriálu pro vysvětlení limitů zoomu novým uživatelům
