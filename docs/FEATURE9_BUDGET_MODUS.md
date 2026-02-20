# Feature 9: Budget-Modus - Implementierungsplan

## 🎯 Ziel

Vordefinierte Budget-Chips und benutzerdefiniertes Budget auf dem Discover Screen. Benutzer können schnell filtern nach Preisbereich.

---

## 📱 UX/UI Konzept

### Budget-Chips

| Label | Bereich |
|-------|---------|
| € | 0 - 200 |
| €€ | 200 - 500 |
| €€€ | 500 - 1000 |
| €€€€ | 1000 - 2000 |
| €€€€€ | 2000+ |
| Benutzerdefiniert | Min/Max Input |

### Placement

- Unter den Stil/Kategorie-Chips auf Discover Screen
- Horizontales ScrollView mit den Chips
- "Benutzerdefiniert" öffnet Min/Max Input Felder

---

## 🏗️ Technische Architektur

### Änderungen

| Datei | Änderung |
|-------|----------|
| `src/screens/DiscoverScreen.tsx` | Budget-Chips hinzufügen |

### Daten

```typescript
interface BudgetOption {
  label: string;
  min?: number;
  max?: number;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { label: '€', max: 200 },
  { label: '€€', min: 200, max: 500 },
  { label: '€€€', min: 500, max: 1000 },
  { label: '€€€€', min: 1000, max: 2000 },
  { label: '€€€€€', min: 2000 },
  { label: 'Alle', min: 0, max: undefined },
];
```

---

## ✅ Checkliste

- [ ] Budget-Chips erstellen (horizontales ScrollView)
- [ ] "Benutzerdefiniert" Option mit Min/Max Input
- [ ] Aktives Budget visuell hervorheben
- [ ] Bestehende Price-Filter Logik integrieren
- [ ] Testen

---

## ⏱️ Geschätzt: 30 Minuten

---

*Erstellt: 2026-02-20*
