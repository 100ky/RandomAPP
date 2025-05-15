# ChatMessage Interface v `social.ts`

Soubor `social.ts` již obsahuje rozhraní pro ChatMessage:

```typescript
export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
```

# Přidáno do `socialStoreEnhanced.ts`

## Stav pro chat

```typescript
chatMessages: [],
unreadChatCount: 0,
```

## Metody pro chat

```typescript
sendChatMessage: (text) => {
  // Odeslání zprávy aktuálním uživatelem
},

addChatMessage: (memberId, memberName, text, isSystem = false) => {
  // Přidání nové zprávy do chatu
},

markAllChatAsRead: () => {
  // Označení všech zpráv jako přečtených
},

clearChatHistory: () => {
  // Vymazání historie chatu
}
```

# Nové komponenty

## `TeamChat.tsx`

- Zobrazení všech zpráv v chatu
- Formulář pro odesílání nových zpráv
- Automatické scrollování na nejnovější zprávy
- Indikace při psaní (typing indicator)
- Různý vzhled pro vlastní a cizí zprávy

## `TeamChallenges.tsx`

- Seznam aktivních týmových výzev
- Zobrazení pokroku jednotlivých výzev
- Zobrazení dokončených výzev
- Detailní informace o výzvách a odměnách

# Změny v AppMenu.tsx

- Přidáno tlačítko pro přístup k týmovému chatu
- Přidáno tlačítko pro přístup k týmovým výzvám

# Změny v index.tsx

- Přidání modálních stavů 'team-chat' a 'team-challenges'
- Handlery pro zobrazení/skrytí těchto modálních stavů
- Rendering komponent TeamChat a TeamChallenges pro příslušné stavy

# Nové CSS soubory

- `Chat.module.css` - styly pro chatovací rozhraní
- `Challenge.module.css` - styly pro zobrazení výzev

# Kompletní dokumentace

Vytvořen soubor `SOCIAL-FEATURES-COMPLETE-GUIDE.md` s detailním popisem všech sociálních funkcí.
