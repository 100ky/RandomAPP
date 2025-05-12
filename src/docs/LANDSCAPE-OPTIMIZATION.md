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

4. **Responzivní vzhled**
   - Přizpůsobení rozložení pro portrait a landscape mód
   - Optimalizace pro velmi malé displeje
   - Podpora pro zařízení s výřezem v displeji (notch)

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
   - Speciální optimalizace pro Samsung zařízení
   - Podpora pro starší verze Androidu (5.0+)

2. **iOS zařízení**

   - iPhone a iPad s iOS 12+
   - Podpora pro notch a dynamické ostrovy
   - Optimalizace pro Safari prohlížeč

3. **Nízkovýkonná zařízení**
   - Automatická detekce starších a slabších zařízení
   - Redukce animací a efektů
   - Optimalizace vykreslování pro plynulý chod

## Známé problémy a jejich řešení

1. **Samsung zařízení v landscape módu**

   - Problém: Nesprávná výška obrazovky v landscape módu
   - Řešení: Aplikace speciální CSS třídy pro Samsung zařízení s lepším výpočtem výšky

2. **Starší Android zařízení**

   - Problém: Trhané animace a pomalé vykreslování
   - Řešení: Detekce a zakázání komplexních animací, použití optimalizačních technik

3. **Zařízení s notchem nebo výřezy v displeji**
   - Problém: Obsah zasahuje do výřezu displeje
   - Řešení: Použití safe-area-inset pro zajištění správných okrajů

## Budoucí vylepšení

1. Implementace výkonnostních testů pro automatickou detekci optimální úrovně efektů
2. Rozšíření podpory pro další specifická zařízení
3. Vytvoření diagnostického nástroje pro reportování problémů s konkrétními zařízeními
