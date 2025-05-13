# Checklist pro testování optimalizací landscape režimu

## Otestovat na zařízeních:

### Android zařízení

- [ ] Samsung Galaxy S10 nebo podobné (poměr 19:9)
- [ ] Samsung Galaxy S20 nebo podobné (poměr 20:9)
- [ ] Starší telefony (Android 7-9)
- [ ] Malé telefony (s výškou displeje pod 700px)
- [ ] Velmi malé telefony (s výškou displeje pod 600px)

### iOS zařízení

- [ ] iPhone 12/13/14 (s notch výřezem)
- [ ] iPhone SE/8 (malý displej)
- [ ] iPad v landscape režimu

## Testovací scénáře

### 1. Základní zobrazení

- [ ] Menu tlačítko (48x48px v portrait, 40x40px v landscape)
- [ ] Zvukové ovládací prvky (stejná velikost jako menu tlačítko)
- [ ] Správné zarovnání ikon v tlačítkách (24px v portrait, 20px v landscape)

### 2. Rozbalené menu

- [ ] Optimalizované rozměry menu (260px v portrait, 240px nebo méně v landscape)
- [ ] Správné velikosti tlačítek (padding 8px 12px v portrait, méně v landscape)
- [ ] Statistické údaje správně zobrazené (100px min-šířka v portrait, 80px v landscape)
- [ ] Text v menu čitelný i na malých displejích

### 3. Herní ovládací prvky

- [ ] Správné velikosti herních tlačítek (padding 10px 20px v portrait)
- [ ] Na malých displejích v landscape: zmenšení a přesun do rohu
- [ ] Na velmi malých displejích: další zmenšení (scale 0.6-0.7)

### 4. Výkonnostní optimalizace

- [ ] Na starších zařízeních: redukované animace
- [ ] Na velmi malých displejích: vypnutí dekorativních efektů
- [ ] Žádné viditelné trhaní nebo zasekávání při zobrazení menu

### 5. Specifické scénáře

- [ ] Zařízení s notch: správné odsazení obsahu
- [ ] Rotace z portrait do landscape: plynulé přepnutí rozložení
- [ ] Rotace zpět do portrait: obnovení původního rozložení

## Heuristické vyhodnocení

### Použitelnost

- [ ] Všechna tlačítka mají dostatečnou velikost pro dotyk (min. 32x32px)
- [ ] Žádné překrývání nebo kolize ovládacích prvků
- [ ] Dobrá čitelnost textu i na malých displejích
- [ ] Konzistentní vzhled napříč zařízeními

### Výkon

- [ ] Plynulé scrollování v menu
- [ ] Plynulé animace (nebo adekvátně redukované)
- [ ] Rychlé reakce na interakce uživatele
- [ ] Žádné nadměrné zahřívání zařízení

### Další poznámky

- Před publikováním otestujte na co největším množství různorodých zařízení
- Zkontrolujte čitelnost při různých světelných podmínkách
- Zvažte testování s uživateli na jejich vlastních zařízeních pro reálnou zpětnou vazbu
