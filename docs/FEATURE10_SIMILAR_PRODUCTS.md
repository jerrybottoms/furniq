# Feature 10: Ähnliche Produkte - Implementierungsplan

## 🎯 Ziel

Auf dem Results Screen und Discover Screen "Mehr like this" bzw. "Das könnte dir auch gefallen" Sektion anzeigen.

---

## 📱 UX/UI Konzept

### Placement

- **Results Screen:** Unter den Suchergebnissen
- **Discover Screen:** Unter den gefilterten Produkten

### Logik

Basierend auf:
1. Aktuelle Kategorie
2. Aktueller Stil
3. Ähnlicher Preisbereich

---

## 🏗️ Technische Architektur

### Neue Funktion

```typescript
// src/data/catalog.ts
function getSimilarProducts(
  item: FurnitureItem, 
  limit: number = 6
): FurnitureItem[]
```

### Logik

1. Gleiche Kategorie bevorzugen
2. Gleicher Stil bevorzugen
3. Preis ±30% Toleranz
4. Max 6 Ergebnisse
5. Aktuelles Item ausschließen

---

## ✅ Checkliste

- [ ] `getSimilarProducts()` in catalog.ts
- [ ] Results Screen: Section hinzufügen
- [ ] Testen

---

## ⏱️ Geschätzt: 45 Minuten

---

*Erstellt: 2026-02-20*
