# Furniq Design System — "Apple Skeleton, Pinterest Soul"

> **Ziel:** Premium-Feel wie Apple, visuelle Wärme wie Airbnb/Pinterest.
> Nutzer sollen der App sofort vertrauen UND Lust aufs Stöbern bekommen.

---

## 1. Design-Philosophie

| Prinzip | Apple-Einfluss | Pinterest/Airbnb-Einfluss |
|---------|---------------|--------------------------|
| **Navigation** | iOS HIG, native Tab Bar | — |
| **Typografie** | SF Pro / System Font, klare Hierarchie | Große Headlines bei Hero-Sektionen |
| **Spacing** | Konsistentes 8pt Grid | Großzügiger Weißraum um Produkte |
| **Farben** | Reduziert, systemische Akzente | Warme Neutraltöne, Produkt = Farbe |
| **Cards** | Subtile Schatten, gerundete Ecken | Große Bilder, kompakter Text |
| **Interaktion** | Haptic Feedback, smooth Animationen | Swipe, Pull-to-refresh, Skeleton Loading |
| **Leerraum** | Großzügig, Luft atmen | Bilder füllen den Raum |

---

## 2. Farbpalette

### Light Mode
```
Background:        #FFFFFF
Surface:           #F2F2F7  (Apple System Gray 6)
Card:              #FFFFFF
Elevated:          #FFFFFF + shadow

Text Primary:      #000000
Text Secondary:    #3C3C43 @ 60% (Apple secondaryLabel)
Text Tertiary:     #3C3C43 @ 30%

Accent:            #1A5F5A  (Furniq Teal — bleibt!)
Accent Light:      #E8F5F3
Accent Pressed:    #145048

Separator:         #3C3C43 @ 12% (Apple separator)
Separator Opaque:  #C6C6C8

Destructive:       #FF3B30  (Apple systemRed)
Success:           #34C759  (Apple systemGreen)
Warning:           #FF9500  (Apple systemOrange)
```

### Dark Mode
```
Background:        #000000  (Apple true black)
Surface:           #1C1C1E  (Apple secondarySystemBackground)
Card:              #2C2C2E  (Apple tertiarySystemBackground)
Elevated:          #2C2C2E

Text Primary:      #FFFFFF
Text Secondary:    #EBEBF5 @ 60%
Text Tertiary:     #EBEBF5 @ 30%

Accent:            #2DD4BF  (Teal aufgehellt für Dark)
Accent Light:      #1A3A36
Accent Pressed:    #5EEAD4

Separator:         #545458 @ 60%
Separator Opaque:  #38383A

Destructive:       #FF453A
Success:           #30D158
Warning:           #FF9F0A
```

---

## 3. Typografie

**System Font** (SF Pro auf iOS, Roboto auf Android — React Native default).

| Element | Größe | Weight | Tracking |
|---------|-------|--------|----------|
| **Large Title** | 34 | Bold | 0.37 |
| **Title 1** | 28 | Bold | 0.36 |
| **Title 2** | 22 | Bold | 0.35 |
| **Title 3** | 20 | Semibold | 0.38 |
| **Headline** | 17 | Semibold | -0.41 |
| **Body** | 17 | Regular | -0.41 |
| **Callout** | 16 | Regular | -0.32 |
| **Subhead** | 15 | Regular | -0.24 |
| **Footnote** | 13 | Regular | -0.08 |
| **Caption 1** | 12 | Regular | 0 |
| **Caption 2** | 11 | Regular | 0.07 |

---

## 4. Spacing & Layout

- **Grid:** 8pt Basis-Einheit
- **Screen Padding:** 16px horizontal (Kompakt), 20px (Standard)
- **Card Padding:** 16px innen
- **Section Spacing:** 32px zwischen Sektionen
- **Element Spacing:** 8px / 12px / 16px
- **Border Radius:**
  - Small (Badges, Tags): 8px
  - Medium (Cards, Buttons): 12px
  - Large (Modal, Bottom Sheet): 16px
  - Image Cards: 12px

---

## 5. Schatten & Elevation

```javascript
// Subtle Card Shadow (Apple-Style)
cardShadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 2,
}

// Elevated Card (Hover/Pressed State, Floating Elements)
elevatedShadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
}

// Modal/Sheet Shadow
modalShadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 8,
}
```

---

## 6. Komponenten-Redesign

### 6.1 Header / Navigation Bar
**Vorher:** Grüner Header (`#1A5F5A`), weißer Text
**Nachher:** Transparenter/weißer Header, Large Title (scrollt mit), Accent nur für Aktionen

```
┌─────────────────────────────┐
│                    ⚙️  🔔   │  ← Rechts: Icons in Accent
│  Entdecken                  │  ← Large Title, schwarz/weiß
│                             │
│  [Suchfeld, abgerundet]    │  ← Apple-Style Suchfeld
└─────────────────────────────┘
```

### 6.2 Tab Bar
**Vorher:** Standard Tab Bar
**Nachher:** Apple-Style Tab Bar mit:
- SF Symbols / Custom Icons (Outline, nicht filled)
- Active: Accent-Farbe (Teal)
- Background: Blurred (iOS) / Solid mit Hairline-Border
- Labels in Caption 2

### 6.3 Produkt-Cards (KERN-ELEMENT — Pinterest-Seele)
**Vorher:** Standard Card mit Bild + Text
**Nachher:** Bild-dominante Card

```
┌─────────────────────┐
│                     │
│    [GROSSES BILD]   │  ← 4:3 oder 1:1, 12px radius
│    70% der Card     │
│                     │
│  ❤️               │  ← Favorite Button, oben rechts im Bild
├─────────────────────┤
│  IKEA                │  ← Caption 2, Text Secondary
│  KALLAX Regal        │  ← Headline, Text Primary
│  €79,99              │  ← Body, Bold, Accent
│  ★ 4.5  ·  Regal    │  ← Caption 1, Tertiary
└─────────────────────┘
   ↑ Subtiler Schatten, kein sichtbarer Border
```

### 6.4 Home Screen — Hero-Bereich
**Vorher:** Kamera/Upload Buttons
**Nachher:** Einladende Hero-Section

```
┌──────────────────────────────┐
│  Guten Morgen, Max 👋       │  ← Title 2
│  Was suchst du heute?        │  ← Body, Secondary
│                              │
│  ┌──────────┐ ┌──────────┐  │
│  │ 📸       │ │ 🖼       │  │  ← Große Touch-Targets
│  │ Foto     │ │ Galerie  │  │     Apple-Style Tiles
│  │ aufnehmen│ │ wählen   │  │     Accent Background Light
│  └──────────┘ └──────────┘  │
│                              │
│  Letzte Suchen               │  ← Title 3
│  ┌────┐ ┌────┐ ┌────┐      │  ← Horizontale Scroll-Cards
│  │img │ │img │ │img │      │
│  └────┘ └────┘ └────┘      │
└──────────────────────────────┘
```

### 6.5 Discover Screen — Visuelles Grid
**Vorher:** Filter-Chips + Grid
**Nachher:** Apple Segmented Control + Pinterest Masonry

```
┌──────────────────────────────┐
│  Entdecken                   │  ← Large Title
│                              │
│  [Suchfeld]                 │
│                              │
│  [Alle] [Stil] [Kategorie]  │  ← Apple Segmented Control
│                              │
│  Dein Stil: Modern           │  ← Personalisiert, Subhead
│                              │
│  ┌─────────┐ ┌─────────┐   │
│  │         │ │ BILD    │   │  ← Masonry-ähnliches Grid
│  │  BILD   │ │         │   │     Unterschiedliche Höhen
│  │         │ ├─────────┤   │     = visuell interessanter
│  ├─────────┤ │         │   │
│  │  BILD   │ │  BILD   │   │
│  └─────────┘ └─────────┘   │
└──────────────────────────────┘
```

### 6.6 Product Detail — Immersive
**Vorher:** Standard Detail Page
**Nachher:** Full-bleed Image, Content scrollt darüber

```
┌──────────────────────────────┐
│                              │
│     [FULL-WIDTH BILD]        │  ← Edge-to-edge, kein Padding
│     Hero Image               │
│                              │
│  ← Zurück          ❤️  ↗️   │  ← Overlay-Buttons
├──────────────────────────────┤
│  IKEA                        │  ← Shop Badge
│  KALLAX Regal 2x4            │  ← Title 1
│  ★★★★☆ 4.5 (127 Reviews)   │
│                              │
│  €79,99                      │  ← Title 2, Accent
│  inkl. MwSt. · Versand €4,99│  ← Footnote, Tertiary
│                              │
│  [  🛒 Zum Shop  ]          │  ← Volle Breite, Accent BG
│  [  🔍 Auf Amazon suchen  ] │  ← Amazon Orange, Secondary
│                              │
│  ─── Beschreibung ───       │
│  Lorem ipsum dolor sit...    │
│  [Mehr anzeigen]             │
│                              │
│  ─── Ähnliche Produkte ───  │
│  [Horizontal Scroll Cards]   │
└──────────────────────────────┘
```

### 6.7 Settings Screen — Apple Grouped List
**Vorher:** Custom UI
**Nachher:** iOS Settings-Style

```
┌──────────────────────────────┐
│  Einstellungen               │  ← Large Title
│                              │
│  ┌──────────────────────────┐│
│  │ 🌙 Dark Mode      [━━] ││  ← Toggle
│  │ 💰 Budget          →    ││
│  │ 🎨 Style-Profil    →    ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 📊 Suchverlauf     →    ││
│  │ 🔔 Preis-Alarme    →    ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ ℹ️ Über Furniq     →    ││
│  │ ⭐ App bewerten    →    ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

---

## 7. Animationen & Micro-Interactions

| Interaktion | Animation |
|------------|-----------|
| Card Press | Scale 0.98 + leichter Schatten-Reduce, 150ms |
| Favorite Toggle | Heart Scale-Pop 1.0 → 1.3 → 1.0, 300ms |
| Tab Switch | Cross-fade, 200ms |
| Pull to Refresh | Native iOS-Style Spinner |
| Screen Transition | iOS Push (horizontal slide) |
| Skeleton Loading | Shimmer-Effect auf Placeholder-Cards |
| Button Press | Opacity 0.7, 100ms |

---

## 8. Umsetzungs-Reihenfolge

### Phase 1 — Foundation (Theme-Datei)
1. `theme/index.ts` komplett neu → Apple-Farben, Typo-Scale, Shadows
2. `theme/typography.ts` → Wiederverwendbare Text-Styles
3. `theme/spacing.ts` → 8pt Grid Constants
4. `theme/shadows.ts` → Elevation Levels

### Phase 2 — Core Components
5. `components/Card.tsx` → Neue Produkt-Card (bild-dominant)
6. `components/Button.tsx` → Primary, Secondary, Destructive, Text
7. `components/Header.tsx` → Transparenter Header mit Large Title
8. `components/SearchBar.tsx` → Apple-Style Suchfeld
9. `components/SectionHeader.tsx` → Konsistente Überschriften
10. `components/SkeletonLoader.tsx` → Shimmer Loading

### Phase 3 — Screen Redesigns
11. **HomeScreen** → Hero + Action Tiles + Recent
12. **DiscoverScreen** → Segmented Control + Visual Grid
13. **ProductDetailScreen** → Full-bleed Image + CTA
14. **SettingsScreen** → Grouped List
15. **FavoritesScreen** → Grid mit Edit-Mode
16. **OnboardingScreen** → Apple-Style Pages
17. **StyleQuizScreen** → Visuelles Quiz, große Bilder

### Phase 4 — Polish
18. Animationen & Haptics einbauen
19. Skeleton Loading States
20. Empty States (schöne Illustrationen/Icons)
21. Error States (freundlich, mit Retry-Action)

---

## 9. Technische Hinweise

- **Keine externen Font-Libraries** — System Font ist SF Pro auf iOS
- **`react-native-reanimated`** für performante Animationen (falls noch nicht drin)
- **`expo-haptics`** für Haptic Feedback
- **`expo-blur`** für Tab Bar / Header Blur
- **Bilder:** `borderRadius: 12` überall, `resizeMode: 'cover'`
- **SafeAreaView** konsequent nutzen (kein manuelles Padding für Notch)
- **Platform.select** für iOS/Android Schatten-Unterschiede

---

## 10. Was sich NICHT ändert

- ✅ Furniq Teal (`#1A5F5A`) bleibt als Accent-Farbe
- ✅ Tab-Struktur (Home, Discover, Favorites, Settings)
- ✅ Alle bestehenden Features bleiben erhalten
- ✅ ThemeContext-Pattern (Light/Dark Mode Toggle)
- ✅ Shop-Farben (IKEA gelb, Otto orange, etc.)
- ✅ Navigation-Stack Struktur

---

*Erstellt: 2026-02-24 | Status: Plan — wartet auf Max' Go*
