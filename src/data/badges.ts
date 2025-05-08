import { Badge } from '../types/game';

export const badges: Badge[] = [
  // Odznaky za prozkoumávání lokací
  {
    id: 'first_location',
    name: 'První krok',
    description: 'Navštívili jste první lokaci!',
    icon: '🧭',
    category: 'exploration',
    rarity: 'common',
    earnCondition: 'Navštivte svou první lokaci v mapě',
    points: 10,
    unlockMessage: 'Získali jste odznak za návštěvu první lokace!',
  },
  {
    id: 'explorer_novice',
    name: 'Začínající průzkumník',
    description: 'Navštívili jste 3 různé lokace',
    icon: '🗺️',
    category: 'exploration',
    rarity: 'common',
    earnCondition: 'Navštivte 3 různé lokace',
    points: 20,
    isProgressBased: true,
    maxProgress: 3,
    unlockMessage: 'Získali jste odznak za návštěvu 3 různých lokací!',
  },
  {
    id: 'explorer_advanced',
    name: 'Pokročilý průzkumník',
    description: 'Navštívili jste 7 různých lokací',
    icon: '🧩',
    category: 'exploration',
    rarity: 'uncommon',
    earnCondition: 'Navštivte 7 různých lokací',
    points: 40,
    isProgressBased: true,
    maxProgress: 7,
    unlockMessage: 'Stáváte se zkušenějším průzkumníkem! Získali jste odznak za návštěvu 7 lokací.',
  },
  {
    id: 'explorer_master',
    name: 'Mistr průzkumník',
    description: 'Navštívili jste všechny lokace ve hře!',
    icon: '🏆',
    category: 'exploration',
    rarity: 'rare',
    earnCondition: 'Navštivte všechny lokace ve hře',
    points: 100,
    isProgressBased: true,
    maxProgress: 10,
    unlockMessage: 'Gratulujeme! Jste skutečný průzkumník - navštívili jste všechny lokace!',
  },
  
  // Odznaky za řešení hádanek
  {
    id: 'puzzle_first',
    name: 'První úspěch',
    description: 'Vyřešili jste svou první hádanku',
    icon: '❓',
    category: 'puzzle',
    rarity: 'common',
    earnCondition: 'Vyřešte první hádanku',
    points: 15,
    unlockMessage: 'Skvěle! Vyřešili jste svou první hádanku!',
  },
  {
    id: 'puzzle_solver',
    name: 'Řešitel hádanek',
    description: 'Vyřešili jste 5 různých hádanek',
    icon: '🧠',
    category: 'puzzle',
    rarity: 'uncommon',
    earnCondition: 'Vyřešte 5 různých hádanek',
    points: 30,
    isProgressBased: true,
    maxProgress: 5,
    unlockMessage: 'Získali jste odznak za vyřešení 5 různých hádanek!',
  },
  {
    id: 'puzzle_master',
    name: 'Mistr hádanek',
    description: 'Vyřešili jste všechny hádanky ve hře!',
    icon: '🎯',
    category: 'puzzle',
    rarity: 'rare',
    earnCondition: 'Vyřešte všechny hádanky ve hře',
    points: 100,
    isProgressBased: true,
    maxProgress: 10,
    unlockMessage: 'Fantastické! Dokázali jste vyřešit všechny hádanky ve hře!',
  },
  {
    id: 'perfect_solver',
    name: 'Geniální mysl',
    description: 'Vyřešili jste 3 hádanky bez použití nápovědy',
    icon: '💡',
    category: 'puzzle',
    rarity: 'rare',
    earnCondition: 'Vyřešte 3 hádanky bez použití nápovědy',
    points: 50,
    isProgressBased: true,
    maxProgress: 3,
    unlockMessage: 'Vaše inteligence je obdivuhodná! Získali jste odznak za vyřešení 3 hádanek bez nápovědy.',
  },
  
  // Odznaky za aktivitu
  {
    id: 'first_1000_steps',
    name: 'Tisíc kroků',
    description: 'Udělali jste svých prvních 1000 kroků během hraní',
    icon: '👣',
    category: 'activity',
    rarity: 'common',
    earnCondition: 'Udělejte 1000 kroků během hraní',
    points: 20,
    isProgressBased: true,
    maxProgress: 1000,
    unlockMessage: 'Udělali jste již 1000 kroků! Skvělý začátek!',
  },
  {
    id: 'walker',
    name: 'Chodec',
    description: 'Udělali jste 5000 kroků během hraní',
    icon: '🚶',
    category: 'activity',
    rarity: 'uncommon',
    earnCondition: 'Udělejte 5000 kroků během hraní',
    points: 40,
    isProgressBased: true,
    maxProgress: 5000,
    unlockMessage: 'Jste výborný chodec! Dosáhli jste 5000 kroků během hraní.',
  },
  {
    id: 'marathon',
    name: 'Maratonec',
    description: 'Urazili jste vzdálenost 5 km během hraní',
    icon: '🏃',
    category: 'activity',
    rarity: 'rare',
    earnCondition: 'Urazte vzdálenost 5 km během hraní',
    points: 60,
    isProgressBased: true,
    maxProgress: 5000,
    unlockMessage: 'Urazili jste 5 kilometrů! Jste opravdový maratonec!',
  },
  
  // Speciální odznaky
  {
    id: 'early_bird',
    name: 'Ranní ptáče',
    description: 'Hráli jste hru mezi 5:00 a 8:00 ráno',
    icon: '🐦',
    category: 'special',
    rarity: 'uncommon',
    earnCondition: 'Hrajte hru mezi 5:00 a 8:00 ráno',
    points: 30,
    isSecret: true,
    unlockMessage: 'Ranní ptáče dál doskáče! Získali jste tajný odznak za hraní v časných ranních hodinách.',
  },
  {
    id: 'night_owl',
    name: 'Noční sova',
    description: 'Hráli jste hru po 22:00',
    icon: '🦉',
    category: 'special',
    rarity: 'uncommon',
    earnCondition: 'Hrajte hru po 22:00',
    points: 30,
    isSecret: true,
    unlockMessage: 'Jste skutečná noční sova! Získali jste tajný odznak za hraní v pozdních večerních hodinách.',
  },
  {
    id: 'quickster',
    name: 'Rychlík',
    description: 'Vyřešili jste hádanku za méně než 30 sekund',
    icon: '⚡',
    category: 'special',
    rarity: 'rare',
    earnCondition: 'Vyřešte hádanku za méně než 30 sekund',
    points: 50,
    isSecret: true,
    unlockMessage: 'Blesk! Vyřešili jste hádanku v rekordním čase a získali tajný odznak.',
  },
  {
    id: 'completionist',
    name: 'Dovršitel',
    description: 'Získali jste všechny ostatní odznaky ve hře',
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    earnCondition: 'Získejte všechny ostatní odznaky ve hře',
    points: 200,
    unlockMessage: 'Absolutní dokonalost! Získali jste všechny odznaky ve hře a stali se skutečným mistrem.',
  },
];

/**
 * Získá odznak podle jeho ID
 */
export const getBadgeById = (id: string): Badge | undefined => {
  return badges.find(badge => badge.id === id);
};

/**
 * Získá seznam všech odznaků v určité kategorii
 */
export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return badges.filter(badge => badge.category === category);
};

/**
 * Získá seznam všech odznaků podle vzácnosti
 */
export const getBadgesByRarity = (rarity: Badge['rarity']): Badge[] => {
  return badges.filter(badge => badge.rarity === rarity);
};