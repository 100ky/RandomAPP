# Vylepšení sociálních funkcí v RandomAPP - Kompletní příručka

## Obsah

1. [Přehled vylepšení](#přehled-vylepšení)
2. [Animace a přechody](#animace-a-přechody)
3. [Týmové funkce](#týmové-funkce)
4. [Notifikační systém](#notifikační-systém)
5. [Chatovací systém](#chatovací-systém)
6. [Týmové výzvy](#týmové-výzvy)
7. [Export a sdílení tras](#export-a-sdílení-tras)
8. [Technická implementace](#technická-implementace)

## Přehled vylepšení

RandomAPP byl rozšířen o řadu sociálních funkcí, které umožňují uživatelům:

- Vytvářet a připojovat se k týmům
- Vidět polohu ostatních členů týmu v reálném čase
- Komunikovat pomocí týmového chatu
- Získávat upozornění o aktivitách ostatních členů týmu
- Společně plnit týmové výzvy a cíle
- Zaznamenávat, exportovat a sdílet trasy v různých formátech
- Účastnit se společně průzkumu lokalit

## Animace a přechody

V rámci vylepšení jsme implementovali:

- Plynulé animace pro notifikace týmových událostí
- Přechodové efekty mezi různými stavy komponent
- Vizuální zpětná vazba při týmových aktivitách
- CSS třídy pro fade-in, slide-up, a pulse animace

Soubor `SocialAnimations.css` obsahuje globální animace, které se používají napříč sociálními komponenty a poskytují jednotný vizuální zážitek.

## Týmové funkce

### Vytvoření týmu

Uživatelé mohou vytvořit vlastní tým a stát se jeho vedoucím. Při vytvoření týmu je automaticky vygenerován unikátní kód, který mohou sdílet s ostatními hráči.

### Připojení k týmu

Hráči se mohou připojit k existujícímu týmu pomocí kódu, který získali od vedoucího týmu. Po připojení mohou vidět všechny členy týmu a jejich polohu na mapě v reálném čase.

### Vizualizace členů týmu

Na mapě se zobrazují markery všech členů týmu s jejich aktuální polohou. To umožňuje koordinaci aktivit a společné prozkoumávání herního světa.

### Správa týmu

Vedoucí týmu může:

- Spravovat členy týmu
- Nastavovat cíle a výzvy
- Ukončit tým nebo předat vedení jinému členovi

## Notifikační systém

Týmový notifikační systém poskytuje upozornění o důležitých událostech v týmu:

- Připojení nebo odpojení člena
- Významný pohyb člena týmu (např. přesun na nové místo)
- Splnění cíle nebo výzvy členem týmu
- Dosažení významného úspěchu

Notifikace se zobrazují v horní části obrazovky a automaticky se skrývají po několika sekundách, aby nerušily hlavní herní zážitek.

## Chatovací systém

Implementovali jsme plnohodnotný chatovací systém pro týmovou komunikaci:

- Možnost posílat a přijímat zprávy od členů týmu
- Zobrazování času odeslání zprávy
- Odlišné zobrazení vlastních a cizích zpráv
- Systémové zprávy o důležitých událostech
- Možnost vymazat historii chatu

Chat je dostupný z hlavního menu aplikace a poskytuje nezbytnou komunikační infrastrukturu pro koordinaci týmových aktivit.

## Týmové výzvy

Systém týmových výzev přidává další motivační prvek do hry:

- Různé typy výzev (vzdálenost, kroky, lokace, hádanky)
- Časové limity pro dokončení
- Týmové odměny za splnění
- Sledování pokroku všech členů týmu
- Zobrazení aktivních i dokončených výzev

Týmové výzvy stimulují spolupráci a poskytují další vrstvu gamifikace pro dlouhodobou motivaci hráčů.

## Export a sdílení tras

### Formáty exportu

Implementovali jsme podporu pro export zaznamenaných tras v různých standardizovaných formátech:

- GPX (GPS Exchange Format) - kompatibilní s většinou GPS zařízení a aplikací
- KML (Keyhole Markup Language) - pro vizualizaci v Google Earth a dalších aplikacích
- GeoJSON - standardní formát pro výměnu geoprostorových dat

### Sdílení tras

Uživatelé mohou jednoduše sdílet své trasy s ostatními hráči pomocí:

- Vygenerovaného kódu pro sdílení
- Přímého exportu do souboru

### Vizualizace tras

Na mapě lze zobrazit:

- Vlastní zaznamenané trasy
- Trasy sdílené ostatními hráči
- Statistiky tras (vzdálenost, trvání, rychlost)

## Technická implementace

### Architektura

Vylepšení jsou postavena na následující architektuře:

- `socialStoreEnhanced.ts` - centrální úložiště pro všechna sociální data
- Stavové komponenty pro různé sociální funkce (TeamChat, TeamEventsContainer, TeamChallenges)
- Bezstavové prezentační komponenty pro vizualizaci (TeamMemberMarker, RouteDisplay)

### Ukládání dat

Pro persistentní ukládání dat používáme kombinaci:

- LocalStorage pro ukládání uživatelských preferencí a dat o připojení
- Zustand pro správu stavu aplikace a sdílení dat mezi komponentami

### Rozšiřitelnost

Systém je navržen modulárně, aby umožňoval snadné přidání dalších sociálních funkcí:

- Systém achievementů a odznaků
- Integrace s externími sociálními sítěmi
- Statistiky a analýzy týmové výkonnosti

## Budoucí vylepšení

V dalších verzích plánujeme přidat:

- Rozšířený statistický systém pro týmy
- Možnost vytváření vlastních výzev
- Integrace s populárními sociálními sítěmi pro sdílení úspěchů
- Systém přátelství a osobních zpráv
- Vylepšené vizualizace tras s výškovým profilem a dalšími parametry
- Napojení na externí fitness služby (Strava, Garmin, atd.) pro sledování aktivit

---

**Dokumentace vytvořena:** 15. května 2025
