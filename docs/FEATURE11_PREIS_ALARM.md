# Feature 11: Preis-Alarm - Implementierungsplan

## 🎯 Ziel

Benutzer können Produkte beobachten und werden benachrichtigt wenn der Preis sinkt. (Für jetzt: lokal speichern, später mit Push Notifications erweitern)

---

## 📱 UX/UI Konzept

### Button auf Produkt-Cards

- 🔔 "Beobachten" / ✓ "Wird beobachtet"
- Auf ResultsScreen und DiscoverScreen

### Speicherung

- AsyncStorage: Liste der beobachteten Produkte mit:
  - Produkt-ID
  - Original-Preis
  - Aktueller Preis (beim Beobachten)
  - Timestamp

### Anzeige

- Favorites-Tab: Badge wenn Preis gesunken
- "Preis gesunken!" Label auf Produkten

---

## 🏗️ Technische Architektur

### Neue Datei

```
src/services/priceTracker.ts
```

### Methoden

```typescript
interface TrackedProduct {
  id: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  currentPrice: number;
  shop: string;
  trackedAt: number;
}

async trackProduct(product: FurnitureItem): Promise<void>
async untrackProduct(productId: string): Promise<void>
async getTrackedProducts(): Promise<TrackedProduct[]>
async isTracked(productId: string): Promise<boolean>
async updateTrackedPrices(): Promise<void> // Für später
```

---

## ✅ Checkliste

- [ ] priceTracker.ts Service erstellen
- [ ] ResultsScreen: Track-Button hinzufügen
- [ ] DiscoverScreen: Track-Button hinzufügen
- [ ] Favorites: Preis-Änderungen anzeigen
- [ ] Testen

---

## ⏱️ Geschätzt: 1.5 Stunden

---

*Erstellt: 2026-02-20*
