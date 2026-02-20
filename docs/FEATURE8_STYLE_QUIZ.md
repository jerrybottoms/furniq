# Feature 8: Style Quiz - Implementierungsplan

## 🎯 Ziel

Ein interaktives Quiz mit 5 Fragen (je 4 Bildern) um den persönlichen Einrichtungsstil des Nutzers zu ermitteln. Das Ergebnis wird gespeichert und für personalisierte Empfehlungen in "Entdecken" verwendet.

---

## 📱 UX/UI Konzept

### Navigation
- **Einstieg:** Button auf DiscoverScreen ("Style finden" oder 💡 Icon)
- **Quiz Screens:** 5 aufeinanderfolgende Screens mit Fortschrittsanzeige
- **Ergebnis:** Zusammenfassung des ermittelten Stils + "Passende Produkte" Button

### Screen-Ablauf

```
[DiscoverScreen] → [StyleQuizIntro] → [Q1] → [Q2] → [Q3] → [Q4] → [Q5] → [Result]
                                                                                  ↓
                                                                         [Discover mit Filter]
```

### Fragen (5 Fragen, je 4 Optionen)

| # | Frage | Option A | Option B | Option C | Option D |
|---|-------|----------|----------|----------|----------|
| 1 | Wohnzimmer-Stil | Skandinavisch hell/holzig | Modern/glänzend | Industrial/dunkel | Vintage/gemütlich |
| 2 | Farbpalette | Natürliche Töne | Schwarz/Weiß | Erdtöne | Bunt/mutig |
| 3 | Material | Holz & Rattan | Leder & Chrom | Metall & Beton | Samt & Flor |
| 4 | Atmosphäre | Minimal & aufgeräumt | Elegant & luxuriös | Rustikal & warm | Boho & locker |
| 5 | Lieblingsmöbel | Gemütliches Sofa | Designer-Stück | Vintages Sammlerstück | Praktisches Multifunktionsmöbel |

### Ergebnis-Berechnung

Jede Antwort gibt Punkte für einen Stil:
- **Skandinavisch:** A1, A2, A3, A4, A5
- **Modern:** B1, B2, B3, B4, B5
- **Industrial:** C1, C2, C3, C4, C5
- **Vintage:** D1, D2, D3, D4, D5
- **Boho/Minimalistisch:** Zusatz-Logik basierend auf Kombinationen

Der Stil mit den meisten Punkten wird als "Dein Stil" gespeichert.

---

## 🏗️ Technische Architektur

### Neue Dateien

```
src/
├── screens/
│   └── StyleQuizScreen.tsx      ← Haupt-Screen (Wizard mit 5 Fragen)
├── components/
│   └── QuizOption.tsx           ← Bild-Option Component
├── data/
│   └── quizQuestions.ts          ← Fragen & Antworten Daten
└── types/
    └── index.ts                 ← Erweitert: QuizResult
```

### Bestehende Dateien (Änderungen)

| Datei | Änderung |
|-------|----------|
| `App.tsx` | Route hinzufügen: `StyleQuiz` |
| `src/services/styleProfile.ts` | Neue Methode: `saveQuizResult(style: string)` |
| `src/screens/DiscoverScreen.tsx` | "Style finden" Button + Ergebnis anzeigen |

### Datenmodell

```typescript
// src/types/index.ts - Erweiterung
interface QuizAnswer {
  questionId: number;
  selectedOption: 'A' | 'B' | 'C' | 'D';
}

interface QuizResult {
  style: FurnitureStyle;
  answers: QuizAnswer[];
  timestamp: number;
}
```

```typescript
// src/data/quizQuestions.ts
interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    imageUrl: string;      // Placeholder für jetzt
    style: FurnitureStyle;
    label: string;
  }[];
}
```

```typescript
// src/services/styleProfile.ts - Neue Methode
interface StyleProfile {
  // ... existing
  quizResult?: QuizResult;  // NEU
}

async saveQuizResult(result: QuizResult): Promise<void>
async getQuizResult(): Promise<QuizResult | null>
```

---

## 🎨 UI Komponenten

### StyleQuizScreen

**Zustände:**
- `intro` - Willkommens-Screen mit Start-Button
- `question` - Frage mit 4 Bild-Optionen
- `result` - Ergebnis-Anzeige

**Elemente:**
- Fortschrittsbalken (Question X of 5)
- Frage-Text oben
- 2x2 Grid mit Bild-Optionen
- "Zurück" Button (außer bei Q1)
- "Überspringen" Button (optional)

### QuizOption Component

```typescript
interface Props {
  imageUrl: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}
```

**States:**
- Default: Rahmen grau
- Selected: Rahmen grün (#1A5F5A), Checkmark
- Pressed: Scale 0.95

---

## 🧮 Logik

### Ergebnis-Berechnung

```typescript
function calculateResult(answers: QuizAnswer[]): FurnitureStyle {
  const scores: Record<FurnitureStyle, number> = {
    'Skandinavisch': 0,
    'Modern': 0,
    'Industrial': 0,
    'Vintage': 0,
    'Boho': 0,
    'Minimalistisch': 0,
  };

  answers.forEach(answer => {
    const question = quizQuestions.find(q => q.id === answer.questionId);
    const selectedOption = question.options.find(o => o.key === answer.selectedOption);
    if (selectedOption) {
      scores[selectedOption.style]++;
    }
  });

  // Höchste Punktzahl gewinnt
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as FurnitureStyle;
}
```

### Speichern & Nutzen

1. Quiz Ergebnis → AsyncStorage (`@furniq_quiz_result`)
2. DiscoverScreen prüft beim Laden: "Hat User Quiz gemacht?"
3. Wenn ja: Zeige "Passend zu deinem Stil: [Stil]" oben mit gefilterten Produkten
4. Wenn nein: Zeige "Style finden" Button

---

## 📦 Assets (Platzhalter)

Für die 5 Fragen × 4 Optionen = 20 Bilder verwenden wir zunächst placehold.co:

```typescript
// Beispiel
imageUrl: 'https://placehold.co/150x150/e8e4d9/333333?text=Skandinavisch'
```

**Langfristig:** Echte Fotos von Einrichtungsstilen (lizenzfrei von Unsplash/Pexels)

---

## ⏱️ Zeitplan

| Phase | Aufgabe | Zeit |
|-------|---------|------|
| 1 | Daten-Modell & Types | 15 min |
| 2 | quizQuestions.ts Daten | 15 min |
| 3 | QuizOption Component | 15 min |
| 4 | StyleQuizScreen (Wizard) | 30 min |
| 5 | styleProfile.ts erweitern | 15 min |
| 6 | App.tsx Route hinzufügen | 10 min |
| 7 | DiscoverScreen Integration | 15 min |
| 8 | **Testen** | 15 min |
| | **Gesamt** | **~2h** |

---

## ✅ Checkliste

- [ ] Types erweitern (QuizAnswer, QuizResult)
- [ ] quizQuestions.ts erstellen mit 5 Fragen
- [ ] QuizOption.tsx Component erstellen
- [ ] StyleQuizScreen.tsx mit Wizard-Logik
- [ ] styleProfile.ts: saveQuizResult() / getQuizResult()
- [ ] App.tsx: StyleQuiz Route hinzufügen
- [ ] DiscoverScreen: "Style finden" Button
- [ ] DiscoverScreen: Ergebnis anzeigen wenn vorhanden
- [ ] Testen: Quiz durchspielen
- [ ] Testen: Ergebnis wird in Discover angezeigt

---

## 🔗 Abhängigkeiten

| Was | Quelle |
|-----|--------|
| Navigation | ✅ Bestehend (@react-navigation) |
| AsyncStorage | ✅ Bestehend (@react-native-async-storage) |
| Bilder | 🔄 placehold.co (ersetzbar) |
| Style Profile Service | ✅ Bestehend (erweitern) |

---

## 🚀 Nächste Schritte (nach Implementation)

1. **Persönliche Empfehlungen** - "Für dich" basierend auf Quiz-Ergebnis
2. **Quiz erweitern** - Mehr Fragen, mehr Stile
3. **Echte Bilder** - Durch lizenzfreie Stock-Fotos ersetzen
4. **Quiz neu starten** - Button um Stil neu zu ermitteln

---

*Erstellt: 2026-02-20*
