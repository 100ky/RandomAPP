/**
 * Utility funkce pro zobrazení achievementů v aplikaci
 */
import { SoundType, playSound } from './SoundManager';

/**
 * Typ pro nastavení achievement notifikace
 */
interface AchievementOptions {
  title: string;             // Název achievementu
  description: string;       // Popis dosažení
  points?: number;           // Počet získaných bodů (nepovinné)
  iconSvg?: string;          // SVG ikona (nepovinné)
  confetti?: boolean;        // Zda zobrazit efekt konfet (výchozí: true)
  autoClose?: boolean;       // Zda automaticky zavřít notifikaci (výchozí: false)
  duration?: number;         // Doba zobrazení v ms, pokud je autoClose true (výchozí: 5000)
  onClose?: () => void;      // Callback po zavření notifikace
}

/**
 * Zobrazí animovanou notifikaci o dosažení cíle (achievementu)
 * 
 * @param options Nastavení achievementu
 */
export function showAchievement(options: AchievementOptions): void {
  const {
    title,
    description,
    points,
    iconSvg,
    confetti = true,
    autoClose = false,
    duration = 5000,
    onClose
  } = options;

  // Výchozí SVG ikona trofeje, pokud není poskytnuta vlastní
  const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>`;

  // Přehrát zvuk achievementu
  playSound(SoundType.ACHIEVEMENT, { volume: 0.8 });

  // Vytvořit notifikační element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';

  // Přidat obsah notifikace
  notification.innerHTML = `
    <div class="achievement-icon">
      ${iconSvg || defaultIcon}
    </div>
    <div class="achievement-title">${title}</div>
    <div class="achievement-description">${description}</div>
    ${points !== undefined ? `<div class="achievement-points">+${points} bodů</div>` : ''}
    <button class="achievement-close-button">Zavřít</button>
  `;

  // Přidat do DOM
  document.body.appendChild(notification);

  // Přidat efekt konfet, pokud je požadován
  if (confetti) {
    createConfetti(notification);
  }

  // Zobrazit notifikaci s animací
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Připojit posluchač události pro tlačítko zavření
  const closeButton = notification.querySelector('.achievement-close-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeAchievement(notification, onClose);
    });
  }

  // Automaticky zavřít po určité době, pokud je nastaveno
  if (autoClose) {
    setTimeout(() => {
      closeAchievement(notification, onClose);
    }, duration);
  }
}

/**
 * Zavře notifikaci achievementu s animací
 * 
 * @param notification Element notifikace
 * @param callback Volitelný callback po zavření
 */
function closeAchievement(notification: HTMLElement, callback?: () => void): void {
  notification.classList.add('fade-out');
  notification.classList.remove('show');
  
  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
      if (callback) {
        callback();
      }
    }
  }, 500);
}

/**
 * Vytvoří efekt konfet pro notifikaci
 * 
 * @param container Element, do kterého se přidají konfety
 */
function createConfetti(container: HTMLElement): void {
  const colors = ['#FFD700', '#FFC107', '#FFEB3B', '#CDDC39', '#8BC34A', '#FF5252', '#E91E63', '#9C27B0'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    // Vytvořit konfetu
    const confetti = document.createElement('div');
    confetti.className = 'achievement-confetti';
    
    // Náhodné vlastnosti pro každou konfetu
    const size = Math.random() * 8 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 1000;
    const rotation = Math.random() * 360;
    
    // Aplikovat styl
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${left}%`;
    confetti.style.top = '0';
    confetti.style.animationDelay = `${delay}ms`;
    confetti.style.transform = `rotate(${rotation}deg)`;
    
    // Náhodný tvar (kruh nebo čtverec)
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = '0';
    }
    
    // Přidat do kontejneru
    container.appendChild(confetti);
    
    // Odstranit konfetu po animaci
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 4000 + delay);
  }
}
