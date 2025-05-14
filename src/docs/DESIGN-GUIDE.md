# Průzkumnický design - Stylový průvodce

## Přehled

Tento dokument poskytuje přehled sjednoceného průzkumnického stylu, který byl implementován v projektu RandomAPP. Cílem bylo vytvořit konzistentní designový systém, který zachovává dobrodružný duch aplikace napříč všemi obrazovkami.

## Základní prvky

### Barevné schéma

Aplikace používá následující barevné proměnné definované v `globals.css`:

```css
--primary-color: #8b4513; /* Hnědá - dobrodružná */
--primary-dark: #6b3100; /* Tmavší hnědá */
--primary-light: #a06235; /* Světlejší hnědá */

--secondary-color: #228b22; /* Lesní zelená */
--secondary-dark: #006400; /* Tmavší zelená */
--secondary-light: #32cd32; /* Světlejší zelená */

--accent-color: #ffd700; /* Zlatá - objevitelská */
--accent-dark: #daa520; /* Tmavší zlatá */
--accent-light: #fff8dc; /* Velmi světlá zlatá */
```

### Typografie

Pro zachování průzkumnického ducha používáme tyto fonty:

```css
--font-adventure: "Cinzel", "Georgia", serif; /* Dobrodružný nadpisový font */
--font-body: "Quattrocento", "Georgia", serif; /* Font pro běžný text */
```

## Komponenty

### Tlačítka

Pro konzistentní vzhled tlačítek používejte třídu `adventure-button`:

```jsx
<button className="adventure-button button-large">Začít průzkum</button>
```

Dostupné velikosti:

- `button-large`
- `button-small`

Dostupné varianty:

- `button-primary` (výchozí)
- `button-secondary`
- `button-accent`
- `button-outline`

### Progress Bar

Používejte sjednocené třídy pro progress bar:

```jsx
<div className="adventure-progress-container">
  <div
    className="adventure-progress-bar"
    style={{ width: `${progress}%` }}
  ></div>
</div>
```

### Mapové prvky

Pro zobrazení mapových komponent použijte třídy z `adventureCore.css`:

```jsx
<div className="adventure-map-scroll">
  <div className="adventure-map-content">
    <div className="adventure-map-path"></div>
    <div className="adventure-map-marker"></div>
    <div className="adventure-map-treasure"></div>
  </div>
  <div className="adventure-map-rolls">
    <div className="adventure-map-top-roll"></div>
    <div className="adventure-map-bottom-roll"></div>
  </div>
</div>
```

## Animace

V aplikaci jsou dostupné tyto základní animační utility:

```css
@keyframes adventure-float {
  ...;
}
@keyframes adventure-pulse {
  ...;
}
@keyframes adventure-rotate {
  ...;
}
@keyframes adventure-shimmer {
  ...;
}
```

## Adaptivní design

Pro optimální zobrazení na různých zařízeních byly implementovány specifické třídy:

```css
.adventure-landscape-container .adventure-landscape-column;
```

## Tmavý režim

Aplikace plně podporuje tmavý režim pomocí CSS proměnných a selektoru `[data-theme="dark"]`.

## Integrace nových komponent

Při integraci nových komponent se ujistěte, že:

1. Používáte barevné proměnné místo pevně zakódovaných hodnot
2. Pokud vytváříte novou komponentu, dodržujte předponu `adventure-`
3. Používejte existující animace pro konzistentní chování
4. Testujte jak na portrait, tak landscape orientaci

## Soubory stylů

- `globals.css` - Základní CSS proměnné a společné styly
- `adventureCore.css` - Specializované průzkumnické komponenty
- `.module.css` soubory - Komponenty specifické pro jednotlivé soubory

## Příklad použití

```jsx
import "../styles/globals.css";
import "../styles/adventureCore.css";

const ExampleComponent = () => (
  <div className="adventure-bg">
    <h1 className="title">Průzkumnický titul</h1>
    <button className="adventure-button">Pokračovat</button>
  </div>
);
```
