# Optimalizace pro landscape mód a mobilní zařízení

## Přehled optimalizací

V aplikaci jsme provedli následující optimalizace pro zajištění správného zobrazení v landscape módu a na různých mobilních zařízeních:

1. **Základní CSS moduly**

   - Vytvořen sdílený `ScreenBase.module.css` s univerzálními styly pro všechny obrazovky
   - Přidány specializované třídy pro různé orientace zařízení
   - Implementovány media queries pro různé velikosti obrazovky

2. **Detekce zařízení**

   - Vytvořen hook `useEnhancedOrientation` pro detekci typu a parametrů zařízení
   - Automatická aplikace CSS tříd podle typu zařízení
   - Speciální detekce a optimalizace pro Samsung zařízení

3. **Výkonnostní optimalizace**

   - Detekce starších a nízkovýkonných zařízení
   - Zakázání komplexních animací na slabších zařízeních
   - Redukce efektů pro zvýšení plynulosti
   - Adaptivní vypínání dekorativních efektů podle výkonu zařízení

4. **Responzivní vzhled**

   - Přizpůsobení rozložení pro portrait a landscape mód
   - Optimalizace pro velmi malé displeje (až do 350px výšky)
   - Podpora pro zařízení s výřezem v displeji (notch)
   - Dynamické přizpůsobení velikosti a umístění ovládacích prvků

5. **Ovládací prvky**
   - Optimalizované velikosti tlačítek v menu i herních ovládacích prvků
   - Konzistentní velikosti mezi tlačítky menu a zvukových kontrol
   - Dynamická úprava velikosti podle dostupného prostoru
   - Speciální optimalizace pro extrémně malé displeje

## Testování landscape módu

Pro testování správného chování aplikace v landscape módu jsme vytvořili následující nástroje:

### Testovací stránky

1. **Hlavní testovací stránka** (`/landscape-test`)

   - Zobrazuje detekované parametry zařízení
   - Umožňuje simulaci různých typů zařízení
   - Poskytuje odkazy na jednotlivé testy obrazovek

2. **Test SplashScreen** (`/landscape-test/splash`)

   - Testování úvodní obrazovky v různých orientacích
   - Možnost simulace různých typů zařízení
   - Snadné restartování pro opakované testy

3. **Test LoadingScreen** (`/landscape-test/loading`)
   - Testování načítací obrazovky v různých orientacích
   - Zobrazení informací o zařízení pro ladění

### Jak testovat

1. Otevřete stránku `/landscape-test` na vašem zařízení
2. Zvolte konkrétní typ zařízení pro simulaci nebo použijte detekované parametry
3. Otestujte obě obrazovky pomocí odkazů "Testovat SplashScreen" a "Testovat LoadingScreen"
4. Vyzkoušejte přepínání mezi portrait a landscape orientací pro kontrolu responzivity

## Typy podporovaných zařízení

Aplikace je optimalizována pro následující typy zařízení:

1. **Android zařízení**

   - Standardní Android telefony a tablety
   - Speciální optimalizace pro Samsung zařízení (řešení problémů s výškou)
   - Podpora pro starší verze Androidu (5.0+)
   - Optimalizace pro různé poměry stran (16:9, 18:9, 20:9)

2. **iOS zařízení**

   - iPhone a iPad s iOS 12+
   - Podpora pro notch a dynamické ostrovy
   - Optimalizace pro Safari prohlížeč
   - Specifické úpravy pro iPhone SE a menší modely

3. **Nízkovýkonná zařízení**

   - Automatická detekce starších a slabších zařízení
   - Adaptivní redukce animací podle výkonu zařízení
   - Vypínání dekorativních efektů pro úsporu výkonu
   - Optimalizace vykreslování pro plynulý chod

4. **Velmi malé displeje**
   - Speciální režim pro zařízení s výškou pod 400px v landscape orientaci
   - Extrémně optimalizovaný režim pro výšky pod 350px
   - Redukované velikosti všech ovládacích prvků
   - Přeskupení a přemístění prvků pro maximální využití prostoru

## Známé problémy a jejich řešení

1. **Samsung zařízení v landscape módu**

   - Problém: Nesprávná výška obrazovky v landscape módu
   - Řešení: Aplikace speciální CSS třídy pro Samsung zařízení s lepším výpočtem výšky a optimalizované velikosti ovládacích prvků

2. **Starší Android zařízení**

   - Problém: Trhané animace a pomalé vykreslování
   - Řešení: Detekce a zakázání komplexních animací, adaptivní snížení počtu efektů a optimalizace výkonu

3. **Zařízení s notchem nebo výřezy v displeji**

   - Problém: Obsah zasahuje do výřezu displeje
   - Řešení: Použití safe-area-inset pro zajištění správných okrajů a správnou pozici ovládacích prvků

4. **Velmi malé displeje v landscape režimu**

   - Problém: Přeplněný UI a překrývání ovládacích prvků
   - Řešení: Zmenšení a přeskupení ovládacích prvků, adaptivní škálování a přemístění hlavních herních kontrol

5. **Dotykové ovládání na malých displejích**

   - Problém: Příliš malé dotyková plocha pro přesný dotyk
   - Řešení: Zachování minimální velikosti dotykových prvků, optimalizace rozmístění pro jednoduché ovládání

6. **iPhone SE a podobně malá zařízení**
   - Problém: Extrémně omezený prostor v landscape orientaci
   - Řešení: Speciální režim s minimálními velikostmi prvků a optimálním využitím prostoru

## Detaily CSS optimalizací

Zde jsou podrobnosti o klíčových CSS optimalizacích, které jsme implementovali:

### Ovládací prvky a tlačítka

1. **Menu tlačítko**

   - Základní velikost: 48x48px (sníženo z 50x50px)
   - V landscape režimu: 40x40px
   - Na malých displejích: 36x36px
   - Na extrémně malých displejích: 32x32px

2. **Menu obsah**

   - Základní šířka: 260px (sníženo z 280px)
   - V landscape režimu: 240px
   - Na velmi malých displejích: 210-220px
   - Adaptivní maximální výška podle velikosti displeje

3. **Akční tlačítka v menu**

   - Základní padding: 8px 12px (sníženo z 10px 15px)
   - V landscape: 6px 10px
   - Na malých displejích: 5px 8px
   - Na velmi malých displejích: 4px 7px

4. **Herní ovládací tlačítka**

   - Základní padding: 10px 20px (optimalizováno z 12px 24px)
   - Základní min-šířka: 160px (sníženo ze 180px)
   - Na malých displejích: transformace (scale 0.8) a přemístění doprava
   - Na velmi malých displejích: dodatečné zmenšení (scale 0.6-0.7)

5. **Zvukové ovládací prvky**
   - Zarovnání s menu tlačítkem (48x48px)
   - V landscape: 40x40px
   - Optimalizace hover efektů pro dotykové obrazovky

### Statistické údaje v menu

1. **Statistické položky**

   - Základní min-šířka: 100px (sníženo ze 110px)
   - V landscape: 80px
   - Na velmi malých displejích: 70px s redukovaným paddingem
   - Adaptivní zalamování obsahu pro extrémně malé displeje

2. **Statistické hodnoty**
   - Základní velikost písma: 1rem (sníženo z 1.1rem)
   - V landscape: postupně redukováno až na 0.85rem
   - Optimalizovaný vertikální spacing

### Výkonnostní optimalizace

1. **Animace a efekty**

   - Redukce složitosti animací na méně výkonných zařízeních
   - Vypínání dekorativních efektů na extrémně malých displejích
   - Optimalizace animačních cyklů pro lepší výkon baterie

2. **Řešení pro specifická zařízení**
   - Speciální opravy pro Samsung zařízení
   - Podpora pro zařízení s výřezem (notch) pomocí safe-area-inset
   - Optimalizace dotyků pro různé typy obrazovek

## Budoucí vylepšení

1. Implementace výkonnostních testů pro automatickou detekci optimální úrovně efektů
2. Rozšíření podpory pro další specifická zařízení (jako Pixel Fold, Galaxy Z Flip)
3. Vytvoření diagnostického nástroje pro reportování problémů s konkrétními zařízeními
4. Další optimalizace pro zařízení s extrémně nízkou výškou (pod 300px)
5. Automatická detekce a přizpůsobení pro zařízení se skládacími displeji
