import { Puzzle, POILocation } from '../types/game';

// Reálné lokace ve Vysokém Mýtě
export const puzzleLocations: POILocation[] = [
  {
    id: 'namesti',
    name: "Náměstí Přemysla Otakara II",
    coordinates: { lat: 49.9533, lng: 16.1617 },
    description: "Téměř čtvercové náměstí (rozměry cca 150×130 m, plocha 1,95 ha) se sítí pravoúhlých ulic typickou pro gotické městské plánování. Lemuje ho 47 původních domů a dominuje mu radnice (Měšťanský dům) a mariánský morový sloup.",
    shortDescription: "Historické centrum města",
    radius: 25, // Objeví se, když je uživatel do 25 metrů od souřadnic
    unlockType: 'both', // Lze objevit GPS i QR kódem
    qrCode: 'vymyto_namesti_1',
    puzzle: {
      id: 'puzzle_namesti',
      title: 'Tajemství morového sloupu',
      description: 'Mariánský morový sloup byl postaven roku 1714 na památku Rastattského míru a ústupu moru. Na sloupu jsou reliéfy světců a Panna Maria s aureolou.',
      question: 'Spočítejte, kolik hvězd má kolem hlavy Panna Maria a kolik reliéfů je na podstavci sloupu. Zadejte součet těchto dvou čísel:',
      answer: '12', // Předpokládaná odpověď - upravte podle skutečnosti
      hints: [
        'Projděte kolem celého sloupu a pečlivě pozorujte reliéfy na podstavci.',
        'Nezapomeňte spočítat hvězdy v aureole Panny Marie na vrcholu sloupu.'
      ],
      difficulty: 'easy',
      locationId: 'namesti',
      points: 50,
      image: '/assets/puzzles/morovy_sloup.jpg'
    }
  },
  {
    id: 'chramsvvavrince',
    name: "Chrám sv. Vavřince",
    coordinates: { lat: 49.9536, lng: 16.1622 },
    description: "Trojlodní vrcholně gotický chrám z tesaného kamene se dvěma věžemi z 13. století. Po požárech v letech 1461 a 1774 získal významné vybavení, zejména pozdně barokní hlavní oltář s největším obrazem Petra Brandla v Čechách a unikátní secesní freskovou výzdobu.",
    shortDescription: "Gotický kostel",
    radius: 20,
    unlockType: 'both',
    qrCode: 'vymyto_chram_1', 
    puzzle: {
      id: 'puzzle_chram',
      title: 'Tajemství chrámu',
      description: 'V kostelní lodi jsou secesní fresky K. V. Maška, které zachycují významné události města, včetně jeho založení Přemyslem Otakarem II.',
      question: 'V kostelní lodi najděte scénu znázorňující založení města Přemyslem Otakarem II. Jaký letopočet se na této fresce objevuje?',
      answer: '1262', // Předpokládaný rok založení - upravte podle skutečnosti
      hints: [
        'Prohlédněte si freskovou výzdobu interiéru chrámu.',
        'Hledejte výjev, kde král předává listinu měšťanům nebo kde je zobrazeno budování města.'
      ],
      difficulty: 'medium',
      locationId: 'chramsvvavrince',
      points: 75,
      image: '/assets/puzzles/chram.jpg'
    }
  },
  {
    id: 'prazskabranka',
    name: "Pražská brána",
    coordinates: { lat: 49.9544, lng: 16.1580 },
    description: "Gotická městská brána z 13. století, jedna ze tří dochovaných bran Vysokého Mýta. Z věže je vyhlídka na historické jádro města a za dobré viditelnosti i Orlické hory. Před branou stojí ocelová socha krále Přemysla Otakara II.",
    shortDescription: "Historická západní brána",
    radius: 15,
    unlockType: 'both',
    qrCode: 'vymyto_prazska_brana',
    puzzle: {
      id: 'puzzle_prazska_brana',
      title: 'Sluneční hodiny',
      description: 'Na věži Pražské brány jsou umístěny sluneční hodiny. Ukazují místní sluneční čas, který se může lišit od času na vašich hodinkách.',
      question: 'Jaký čas právě nyní ukazují sluneční hodiny na věži? Zadejte rozdíl v minutách oproti vašim hodinkám (pouze číslo):',
      answer: '15', // Předpokládaný rozdíl - bude se měnit podle denní doby a ročního období
      hints: [
        'Sluneční hodiny ukazují místní sluneční čas, který je závislý na poloze Slunce.',
        'Porovnejte čas na slunečních hodinách s přesným časem na vašich hodinkách nebo telefonu.'
      ],
      difficulty: 'medium',
      locationId: 'prazskabranka',
      points: 100,
      image: '/assets/puzzles/prazska_brana.jpg'
    }
  },
  {
    id: 'litomyslskabranka',
    name: "Litomyšlská (Státní) brána",
    coordinates: { lat: 49.9530, lng: 16.1650 }, // Přibližné souřadnice - upravte podle skutečnosti
    description: "Zrekonstruovaná novogotická vstupní brána do historického centra, původně součást hradeb od 13. století. Na vnější straně brány je nástěnné sgrafito od Mikoláše Alše (sv. Jiří bojující s drakem), symbol města.",
    shortDescription: "Východní městská brána",
    radius: 15,
    unlockType: 'both',
    qrCode: 'vymyto_litomyslska_brana',
    puzzle: {
      id: 'puzzle_litomyslska_brana',
      title: 'Sgrafito sv. Jiří',
      description: 'Na vnější straně Litomyšlské brány je umístěno sgrafito od Mikoláše Alše, znázorňující sv. Jiří bojujícího s drakem.',
      question: 'Jaké písmeno lze najít ukryté ve sgrafitu sv. Jiřího? (jedno velké písmeno)',
      answer: 'J', // Předpokládané písmeno - upravte podle skutečnosti
      hints: [
        'Pozorně si prohlédněte celé sgrafito, zvláště detaily kresby.',
        'Hledejte písmeno J jako Jiří nebo D jako drak - jedno z nich je odpovědí.'
      ],
      difficulty: 'hard',
      locationId: 'litomyslskabranka',
      points: 125,
      image: '/assets/puzzles/litomyslska_brana.jpg'
    }
  },
  {
    id: 'regionalnimuzeum',
    name: "Regionální muzeum",
    coordinates: { lat: 49.9532, lng: 16.1601 },
    description: "Muzeum s expozicí historie města a regionu, archeologických nálezů a městské architektury.",
    shortDescription: "Muzeum historie města",
    radius: 20,
    unlockType: 'qr',
    qrCode: 'vymyto_muzeum_1',
    puzzle: {
      id: 'puzzle_muzeum',
      title: 'Historie skrytá v muzeu',
      description: 'V muzeu je vystaven předmět, který dokumentuje dávnou historii města.',
      question: 'Jaký je nejstarší vystavený předmět v muzeu podle informační tabule? (jedno slovo)',
      answer: 'sekeromlat',
      hints: [
        'Hledejte v archeologické sekci.',
        'Je to kamenný nástroj z mladší doby kamenné.'
      ],
      difficulty: 'hard',
      locationId: 'regionalnimuzeum',
      points: 150,
      image: '/assets/puzzles/muzeum.jpg'
    }
  },
  {
    id: 'vodarenskabasta',
    name: "Vodárenská bašta",
    coordinates: { lat: 49.9522, lng: 16.1596 },
    description: "Hranolová kamenná věž v severozápadním rohu historických hradeb, původně z 2. pol. 14. stol. Ve 2. pol. 18. stol. byla upravena na vodárnu, zásobovala městské kašny pitnou vodou.",
    shortDescription: "Historická vodárenská věž",
    radius: 15,
    unlockType: 'both',
    qrCode: 'vymyto_vodarna_1',
    puzzle: {
      id: 'puzzle_vodarna',
      title: 'Geometrie věže',
      description: 'Vodárenská bašta je hranolová kamenná věž s osmiúhelníkovým půdorysem. Má masivní kamenné zdivo o síle až 1,5 metru.',
      question: 'Spočítejte počet rovných hran starého kamenného zdiva při pohledu zdola nahoru:',
      answer: '8',
      hints: [
        'Obejděte baštu dokola a počítejte viditelné hrany.',
        'Každý roh věže vytváří jednu svislou hranu.'
      ],
      difficulty: 'medium',
      locationId: 'vodarenskabasta',
      points: 75,
      image: '/assets/puzzles/vodarna.jpg'
    }
  },
  {
    id: 'choceňskavez',
    name: "Choceňská (Karaska) věž",
    coordinates: { lat: 49.9532, lng: 16.1645 }, // Přibližné souřadnice - upravte podle skutečnosti
    description: "Pozůstatek původní dvouvěžové Choceňské brány na východním okraji centra. Postavena 14. stol., původní spojená brána shořela v roce 1844 a byla stržena, zůstala věž Karaska (výška 22 m) s renesanční barokní nástavbou kopule.",
    shortDescription: "Historická věž Karaska",
    radius: 15,
    unlockType: 'gps',
    puzzle: {
      id: 'puzzle_karaska',
      title: 'Požár věže',
      description: 'Věž Karaska v minulosti několikrát hořela. Na věži můžete najít nápis s letopočtem jednoho z požárů.',
      question: 'Najděte na Karasce nápis s rokem požáru a zadejte jej:',
      answer: '1844', // Předpokládaný rok - upravte podle skutečnosti
      hints: [
        'Hledejte nápis nebo pamětní desku na stěně věže.',
        'Podívejte se na informační tabuli v blízkosti věže.'
      ],
      difficulty: 'medium',
      locationId: 'choceňskavez',
      points: 100,
      image: '/assets/puzzles/karaska.jpg'
    }
  },
  {
    id: 'jungmannovysady',
    name: "Jungmannovy sady",
    coordinates: { lat: 49.9540, lng: 16.1600 }, // Přibližné souřadnice - upravte podle skutečnosti
    description: "Dřívější příkop hradeb mezi Choceňskou a Pražskou branou, upravený 1872–1875 k poctě Josefa Jungmanna. V parku jsou vsazeny pamětní desky připomínající významné události z dějin města.",
    shortDescription: "Historický park s hradbami",
    radius: 30,
    unlockType: 'gps',
    puzzle: {
      id: 'puzzle_jungmannovy_sady',
      title: 'Letopočty v parku',
      description: 'V Jungmannových sadech se nachází několik pomníků a pamětních desek s různými letopočty, které připomínají významné události města.',
      question: 'Najděte v parku tři nejstarší letopočty na pamětních deskách a seřaďte je vzestupně. Zadejte prostřední letopočet:',
      answer: '1872', // Předpokládaný rok - upravte podle skutečnosti
      hints: [
        'Projděte celý park a zapisujte si všechny letopočty, které najdete na pomnících a deskách.',
        'Hledaný letopočet může být rok založení parku nebo významná událost města.'
      ],
      difficulty: 'hard',
      locationId: 'jungmannovysady',
      points: 150,
      image: '/assets/puzzles/jungmannovy_sady.jpg'
    }
  },
  {
    id: 'socha_premysla_otakara',
    name: "Socha Přemysla Otakara II.",
    coordinates: { lat: 49.9545, lng: 16.1575 }, // Přibližné souřadnice - upravte podle skutečnosti
    description: "Originální ocelová socha (výška 2,5 m) od Karla Bureše z roku 2012 před Pražskou branou. Král drží v podpaží listinu zakládající město. Jedná se o historicky první sochu krále Přemysla Otakara II. v ČR.",
    shortDescription: "Socha zakladatele města",
    radius: 10,
    unlockType: 'both',
    qrCode: 'vymyto_premysl_otakar',
    puzzle: {
      id: 'puzzle_socha_premysla',
      title: 'Falza listiny',
      description: 'Přemysl Otakar II. drží v ruce listinu zakládající město. Nápis na ní je zajímavým detailem sochy.',
      question: 'Přečtěte nápis na falza listiny, kterou král drží. Zadejte přesný text (rozlišujte velká/malá písmena):',
      answer: 'Statuta MEO', // Předpokládaný text - upravte podle skutečnosti
      hints: [
        'Obejděte sochu a najděte úhel, ze kterého je text listiny čitelný.',
        'Hledejte latinský text na pergamenu, který král drží.'
      ],
      difficulty: 'hard',
      locationId: 'socha_premysla_otakara',
      points: 100,
      image: '/assets/puzzles/premysl_otakar.jpg'
    }
  }
];