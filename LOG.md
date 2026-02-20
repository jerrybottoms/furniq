# Furniq App - Projekt Log

## App Name Change
- **Name:** Furniture Finder → **Furniq**
- **Bundle ID:** com.furniturefinder.app → com.furniq.app
- **Package:** furniture-finder → furniq
- **Farben:** #4A90D9 → #1A5F5A (Dark Teal - Premium/Interior Vibe)

## 2026-02-20

### Schritt 1: Environment Setup
- Node.js v25.6.1 installiert (via Homebrew)
- npm v11.9.0 installiert
- pnpm global installiert

### Schritt 2: Projekt Verzeichnis
- Erstellt: ~/furniture-finder

### Schritt 3: Expo Projekt Initialisierung
- Expo App erstellt mit blank-typescript Template
- Projektpfad: /Users/jerrybottoms/.openclaw/workspace/furniture-finder

### Schritt 4: Dependencies Installiert
- expo-image-picker (Kamera/Galerie)
- expo-file-system
- expo-linking
- @supabase/supabase-js
- @react-navigation/native
- @react-navigation/native-stack
- react-native-screens
- react-native-safe-area-context

### Schritt 5: Ordner-Struktur Erstellt
```
src/
├── components/
├── screens/
│   ├── HomeScreen.tsx
│   └── ResultsScreen.tsx
├── services/
│   ├── supabase.ts
│   ├── imageAnalysis.ts
│   └── productSearch.ts
├── types/
│   └── index.ts
├── utils/
└── hooks/
```

### Schritt 6: Core Files Erstellt
- **src/types/index.ts** - TypeScript Interfaces (FurnitureItem, AnalysisResult, etc.)
- **src/services/supabase.ts** - Supabase Client Config
- **src/services/imageAnalysis.ts** - OpenAI Vision Integration
- **src/services/productSearch.ts** - Amazon/Google Shopping Suche
- **src/screens/HomeScreen.tsx** - Hauptbildschirm mit Kamera/Upload
- **src/screens/ResultsScreen.tsx** - Produkt-Ergebnisse mit Affiliate-Links
- **App.tsx** - Navigation Setup
- **.env.example** - Environment Variables Template
- **README.md** - Projekt-Dokumentation

### Schritt 7: App Funktionalität (MVP)
1. 📸 Foto aufnehmen oder aus Galerie wählen
2. 🤖 OpenAI Vision analysiert Bild (Kategorie, Stil, Farbe, Material)
3. 🔍 Produkte suchen (aktuell Mock-Daten)
4. 🛒 Affiliate-Links anzeigen

### Nächste Schritte
- [ ] Supabase Account erstellen & konfigurieren
- [ ] OpenAI API Key hinzufügen
- [ ] Echte Amazon/Google Shopping API Integration
- [ ] Favoriten Feature
- [ ] TestFlight Build

### API Keys die noch fehlen
- [ ] EXPO_PUBLIC_SUPABASE_URL
- [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] EXPO_PUBLIC_OPENAI_API_KEY
- [ ] EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG

---

## Phase 1 Abgeschlossen ✅

Projekt-Status: MVP Grundgerüst fertig. App läuft mit Mock-Daten.

---

## Phase 2: Kamera & Bildauswahl

**Ziel:** Funktionsfähiger Photo-Upload

### Steps:
1. [x] Image Picker konfigurieren (Kamera + Galerie)
2. [x] Bild-Vorschau anzeigen
3. [x] Base64 Konvertierung
4. [x] Error Handling (Permissions, leeres Bild)
5. [x] Bild-Komprimierung optimieren

### Implementiert:
- **src/hooks/usePermissions.ts** - Permissions Hook (Kamera + Galerie)
- **src/utils/imageUtils.ts** - Image Utilities Service
  - pickFromCamera() mit Crop
  - pickFromGallery() mit Crop
  - pickMultipleFromGallery() (bis 5 Bilder)
  - processForVisionAPI() für Base64
  - uriToBase64() Konvertierung
- **src/screens/HomeScreen.tsx** - Optimiert
  - Permissions Handling
  - Thumbnail-Vorschau mit Entfernen-Button
  - Mehrere Bilder auswählen (bis 5)
  - Lade-States
  - Bessere Error-Meldungen

### Tech-Entscheidungen:
- expo-image-picker (bereits installiert)
- Komprimierung: Quality 1 (App-seitig), dann Base64

---

## Phase 3: KI-Bildanalyse ✅

**Ziel:** Bild → Strukturierte Daten

### Implementiert:
- **src/services/imageAnalysis.ts** — Komplett überarbeitet
  - Optimierter Prompt (Deutsch, strukturiert, Möbel-spezifisch)
  - Retry-Logik (max 3 Versuche, exponential backoff)
  - Response-Validierung & Sanitization
  - Markdown-Cleanup (```json blocks)
  - Auth-Error Erkennung (kein Retry bei 401/403)
  - searchTerms Feld für bessere Produktsuche
- **src/types/index.ts** — searchTerms Feld hinzugefügt
- **src/services/productSearch.ts** — Nutzt jetzt searchTerms
- **.env** — OpenAI API Key konfiguriert
- **.gitignore** — .env hinzugefügt

### TypeScript: ✅ Keine Fehler

---

## Phase 4: Produkt-Suche — Planung

### Ziel
Ähnliche Produkte finden und mit Affiliate-Links anzeigen

### Optionen für Produktdaten:
| Quelle | API nötig? | Kosten | Status |
|--------|-------------|--------|--------|
| Amazon Search URL | Nein | €0 | ✅ Sofort |
| Amazon PA-API | Ja | €0 | ⏳ Braucht Account |
| Google Shopping | Ja | ~$0/Tag | Mit Key |
| IKEA (Awin) | Ja | €0 | ⏳ Apply nötig |
| Wayfair | Ja | €0 | ⏳ Apply nötig |

### Steps:
1. [ ] Amazon Search URL optimieren (Deep-Links, Tracking)
2. [ ] Google Shopping API integrieren (braucht Key)
3. [ ] Mehr Produktquellen vorbereiten (IKEA, Wayfair)
4. [ ] Resultate verbessern (20+, Sortierung, Filter)

### Offene Fragen:
- [ ] Amazon Associate Account vorhanden? → **Später eintragen**
- [ ] Google Shopping API Key besorgen? → **Später**

### 📋 Phase 4 Entscheidung (Max):
- Amazon PA-API → **Später** (braucht Account + 24h)
- Google Shopping API → **Später** (braucht Key)
- Erstmal MVP mit Search URL + Mock-Daten

---

## Phase 5: Results Display + Supabase + Länder-Anpassung

### Phase 5a: Supabase Setup ✅

**Implementiert:**
- **src/services/supabase.ts** — Komplett überarbeitet
  - Auth: signUp, signIn, signInWithGoogle, signOut
  - Favoriten: addFavorite, removeFavorite, getFavorites
  - LocalStorage Fallback (wenn nicht eingeloggt)
  - Search History: addSearchHistory, getSearchHistory
  - Länder-Erkennung: detectCountry(), getCountryConfig()
  - Country Configs: DE, AT, CH, US, UK

- **Dependencies installiert:**
  - @react-native-async-storage/async-storage
  - expo-secure-store

- **.env.example** aktualisiert

### 🔐 Security Updates:
- **SecureStore** für Auth Tokens (iOS Keychain)
- **SECURITY.md** erstellt mit:
  - RLS Policies (SQL) für Supabase
  - Datenschutz-Checkliste
  - API Key Sicherheits-Empfehlungen
  - DSGVO Hinweise

### TypeScript: ✅ Keine Fehler

### Phase 5b: Filter & Sort + UI Polish ✅

**Implementiert:**
- **src/screens/ResultsScreen.tsx** — Komplett überarbeitet
  - Shop Filter (horizontal Chips: Amazon, IKEA, Wayfair, Various)
  - Sortierung: Relevanz, Preis ↑, Preis ↓
  - Favoriten Button (❤️) mit Supabase/LocalStorage
  - Confidence Bar (Erkennungs-Sicherheit)
  - Preis-Formatierung (€299,00 statt "299 EUR")
  - Deutsche UI Texte
  - "Neue Suche" Button
  - Bessere Empty State
  - Material Tag im Header

### TypeScript: ✅ Keine Fehler

### Nächste Schritte:
- [ ] Phase 5c: Länder-Anpassung in Product Search
- [ ] Phase 5d: Weitere UI Polish

### Ziel
Ergebnisse anzeigen, User-Accounts, länderspezifische Suche

### 1. Results Display (UI)
**Filter & Sort (High Priority)**
- [ ] Price Range Filter (min/max)
- [ ] Shop Filter (Amazon, IKEA, Wayfair, Various)
- [ ] Sortierung: Price Low→High, High→Low

**UI Verbesserungen (Medium)**
- [ ] Bessere Price-Formatierung (€299)
- [ ] Pull-to-refresh
- [ ] Loading Skeleton
- [ ] Error State mit Retry

**Extras (Low)**
- [ ] "Nochmal suchen" Button
- [ ] Share Button

### 2. Supabase Integration (User Accounts)
- [ ] supabase.ts: Client mit Platzhalter-Keys
- [ ] Auth: Sign Up / Sign In (Email + Google)
- [ ] Favoriten: Speichern/Laden von Produkten
- [ ] .env.example: Supabase Keys dokumentieren

### 3. Länder-Anpassung
- [ ] Land-Erkennung (IP oder Device Locale)
- [ ] Deutsche Version:
  - Amazon.de
  - IKEA.com/de
  - Wayfair.de (oder .com mit DE-Lieferung)
  - Google Shopping DE
- [ ] Currency: EUR anzeigen
- [ ] Später erweiterbar: AT, CH, etc.

### 4. Weitere Features (später)
- [ ] Push-Benachrichtigungen
- [ ] Preis-Alarme
- [ ] History

---

### Implementierungs-Reihenfolge:
1. **Phase 5a:** Supabase Client + Auth (Platzhalter)
2. **Phase 5b:** Filter & Sort UI
3. **Phase 5c:** Länder-Anpassung
4. **Phase 5d:** UI Polish

---

### Fragen:
1. **Supabase jetzt?**
2. **Länder: Erstmal nur DE?**
3. **Favoriten: LocalStorage first oder gleich Supabase?**

---

## Phase 4: Produkt-Suche ✅

**Ziel:** Ähnliche Produkte finden mit Platzhaltern

### Implementiert:
- **src/services/productSearch.ts** — Komplett überarbeitet
  - Realistische Mock-Daten (6+ pro Shop)
  - Amazon Search URL mit Deep-Links & Tracking
  - IKEA Search URL vorbereitet
  - Wayfair Search URL vorbereitet
  - Google Shopping (Mock)
  - Deduplizierung (max 20 Results)
  - Alle Shops: Amazon, IKEA, Wayfair, Various

### Mock Daten:
- Amazon: 6 Produkte (€249-599)
- IKEA: 6 Produkte (€65-299)
- Wayfair: 6 Produkte (USD $279-549)
- Google: 4 Produkte (€129-549)

### TypeScript: ✅ Keine Fehler

---

## Phase 5b: Filter & Sort + UI Polish ✅

**Implementiert:**
- **src/screens/ResultsScreen.tsx** — Komplett überarbeitet
  - Shop Filter (Chips), Sortierung, Favoriten, Confidence Bar
  - Deutsche UI, Preis-Formatierung, "Neue Suche" Button

---

## Phase 5c: Länder-Anpassung + AWIN ✅

**Implementiert:**
- **productSearch.ts** — Länder-basiert
  - DE/AT/CH: Amazon + IKEA + AWIN + Google
  - US/UK: Amazon + IKEA + Wayfair + Google
  - **Wayfair für DE ausgeblendet**
  - **AWIN Shops (6)**:
    - Otto, home24, Westwing, Mömax, XXXLutz, Etsy
  - Separate AWIN Deep-Links pro Shop
  - 2-3 Produkte pro Shop
- **.env.example** — AWIN_ID dokumentiert

---

## Aktueller Stand

### ✅ Funktioniert:
- Kamera/Galerie mit Crop
- Bild-Analyse (OpenAI Vision)
- Search Terms generiert
- Results Screen mit Affiliate-Links

### ⏳ Später:
- Echte Amazon PA-API
- Echte Google Shopping API
- IKEA, Wayfair Affiliate
- Supabase Backend

### 📱 Nächster Schritt:
Phase 5: Results Display polieren, dann TestFlight

---

## Phase 5d: UI Polish ✅ (in progress)

**Implementiert:**
- **app.json** — Vervollständigt
  - Bundle Identifier: com.furniturefinder.app
  - iOS Permissions: Kamera, Fotobibliothek
  - Splash Screen (blau)
- **App.tsx** — Navigation erweitert (Favorites, Auth)
- **FavoritesScreen.tsx** — NEU (Liste, Pull-to-refresh, Delete)
- **AuthScreen.tsx** — NEU (Sign In/Up, Google OAuth)
- **HomeScreen.tsx** — Quick Action Buttons

### TypeScript: ✅ Keine Fehler

---

## Phase 5d: Abgeschlossen ✅

**Implementiert:**
- Bessere Error Handling (Netzwerk, API, Rate Limit)
- Quick Action Buttons (Favoriten, Anmelden)
- FavoritesScreen + AuthScreen
- app.json complete

---

## Feature 6: App Icon ✅

**Implementiert:**
- **app.json** — Icon Konfiguration bereits vorhanden
  - `icon.png` (1024x1024)
  - `adaptive-icon.png` (Android)
  - `splash-icon.png`
- Default Expo Icons als Placeholder (können später ersetzt werden)

### TypeScript: ✅ N/A

---

## ✅ Alle 6 Features Abgeschlossen!

**Übersicht:**
1. ✅ Settings Screen (Länderwahl)
2. ✅ Price Range Filter
3. ✅ Search History (lokal + Supabase)
4. ✅ Share-Funktion
5. ✅ Onboarding (3 Screens)
6. ✅ App Icon (Placeholder)

---

## 📋 Nächste Schritte

1. **App Name & Design** — besprechen
2. **Echte Icons erstellen** — später
3. **Android APK bauen** — möglich jetzt
4. **iOS TestFlight** — braucht Apple Developer Account

---

## App Name & Design Konzept

**Implementiert:**
- **src/screens/OnboardingScreen.tsx** — NEU
  - 3 Screens: Fotografieren, KI-Analyse, Vergleichen
  - Paging mit FlatList
  - Pagination Dots
  - "Weiter" / "Überspringen" Buttons
- **App.tsx**
  - Checkt `@furniture_finder_onboarding_seen` beim Start
  - Zeigt Onboarding nur beim ersten Mal
  - Loading State während Prüfung
- AsyncStorage Key für Flag

### TypeScript: ✅ Keine Fehler

---

## Feature 4: Share-Funktion ✅

**Implementiert:**
- **ResultsScreen.tsx**
  - `Share` API Import
  - `shareProduct()` Funktion — öffnet Share Sheet
  - Share Button (📤) neben Favorite Button
  - Teilt: Name + Preis + Affiliate Link

### TypeScript: ✅ Keine Fehler

---

## Feature 3: Search History ✅

**Implementiert:**
- **src/services/history.ts** — NEU
  - `addToHistory()` — speichert lokal + Supabase
  - `getHistory()` — liest Supabase wenn eingeloggt, sonst lokal
  - `getLocalHistory()` — AsyncStorage Fallback
  - `clearHistory()` — löscht lokal
  - `formatRelativeTime()` — "vor 2 Std.", "gestern", etc.
- **HomeScreen.tsx** — History geladen beim Start
  - Nach Suche: automatisch in History speichern
  - "Letzte Suchen" Sektion auf HomeScreen
  - Zeigt max 5 letzte Suchen

### TypeScript: ✅ Keine Fehler

---

## Feature 2: Price Range Filter ✅

**Implementiert:**
- **ResultsScreen.tsx** — Price Filter hinzugefügt
  - State: `priceRange`, `showPriceFilter`
  - Min/Max Eingabefelder
  - "Zurücksetzen" Button
  - Automatischer Preisbereich aus Produkten
  - Filter wird in useMemo angewendet
- Styles für Price Filter UI

### TypeScript: ✅ Keine Fehler

---

## Feature 1: Settings Screen ✅

**Implementiert:**
- **src/types/index.ts** — `Settings` Interface hinzugefügt
- **src/services/settings.ts** — NEU
  - `getSettings()` / `saveSettings()` via AsyncStorage
  - `Settings`: country, darkMode, notificationsEnabled
- **src/screens/SettingsScreen.tsx** — NEU
  - Länderwahl (DE, AT, CH, US, UK) mit Flaggen
  - Dark Mode Toggle (disabled, in Entwicklung)
  - Notifications Toggle (disabled, in Entwicklung)
  - Datenschutz / Impressum Links
  - Reset Funktion
- **App.tsx** — Settings Screen in Navigation
- **HomeScreen.tsx** — ⚙️ Einstellungen Button
- **supabase.ts** — `detectCountry()` liest jetzt aus Settings
- **productSearch.ts** — `await getCountryConfig()` (async)

### TypeScript: ✅ Keine Fehler

---

## Phase 6: TestFlight Prep (Dokumentation)

**Dokumentation erstellt:** `docs/PHASE6.md`

**Inhalt:**
- Apple Developer Account Info (€99/Jahr)
- Bundle Identifier Registration
- EAS Setup Commands
- TestFlight Workflow

### ❌ Blockiert: Apple Developer Account

**Benötigt:**
1. Apple Developer Account (€99/Jahr)
2. Bundle ID in Apple Portal registrieren
3. `eas login` auf Mac

### Alternative: Android APK
Kann jetzt schon gebaut werden (ohne Apple Account)
- Kamera/Galerie mit Crop
- Bild-Analyse (OpenAI Vision)
- Results Screen mit Filter/Sort
- AWIN Shops (6): Otto, home24, Westwing, Mömax, XXXLutz, Etsy
- Favoriten speichern
- Auth Screens

### Nächste Schritte:
- [ ] Loading/Error States verbessern
- [ ] TestFlight vorbereiten (Phase 6)

---

## 📋 Mock Daten Übersicht

### Produkt-Suche (alle Shops Mock)
- Amazon: 6 Produkte (placeholder)
- IKEA: 6 Produkte (placeholder)
- Wayfair: 6 Produkte (placeholder)
- Otto: 3 Produkte (AWIN Mock)
- home24: 2 Produkte (AWIN Mock)
- Westwing: 2 Produkte (AWIN Mock)
- Mömax: 2 Produkte (AWIN Mock)
- XXXLutz: 2 Produkte (AWIN Mock)
- Etsy: 2 Produkte (AWIN Mock)

**→ Muss durch AWIN Product Feed ersetzt werden**

### Feature 7 (Entdecken) - auch Mock
- Katalog mit 50-100 Produkten (geplant)
- Noch nicht implementiert

---

## 📁 Masterplan erstellt
- `docs/MASTERPLAN.md` - Vollständige Übersicht
- Enthält: Mock Daten, Roadmap, API Keys, offene Tasks

---

## Feature 7: Entdecken / Inspiration ✅

**Implementiert:**
- **src/screens/DiscoverScreen.tsx** — NEU
  - Stil-Chips: Skandinavisch, Modern, Industrial, Vintage, Boho, Minimalistisch
  - Kategorie-Chips: Sofa, Stuhl, Tisch, Schrank, Regal, Lampe, Bett
  - Preis-Range (Min/Max Input)
  - "Für dich" Section (basierend auf Stil-Profil)
  - 2-Spalten Produkt-Grid (50 Mock-Produkte)
- **src/data/catalog.ts** — NEU
  - STYLES + CATEGORIES Konstanten
  - MOCK_CATALOG mit 50 Produkten
  - getFilteredCatalog() Filter-Funktion
- **src/services/styleProfile.ts** — NEU
  - Stil-Profil Tracking aus Suchverlauf
  - getTopStyles(), getPreferredStyle()
- **App.tsx**
  - Bottom Tab Navigation (Home, Entdecken, Favoriten, Settings)
  - Tab Icons + Styling

### TypeScript: ✅ Keine Fehler

---

## 📋 Mock Daten Liste erstellt

**Dokumentation:** `docs/MASTERPLAN.md`

### Zusammenfassung: 11 Mock-Daten-Stellen

| Priorität | Anzahl | Bereich |
|-----------|--------|---------|
| **Kritisch** | 9 | Produkt-Suche (Amazon, IKEA, Wayfair, Otto, home24, Westwing, Mömax, XXXLutz, Etsy) |
| **Nice to Have** | 2 | Entdecken Katalog, "Für dich" Empfehlungen |

### Nächste Schritte:
1. AWIN Product Feed beantragen
2. Amazon Associate Account erstellen
3. productSearch.ts + catalog.ts anpassen

---

## 📋 Komplette Mock Daten Liste erstellt

**Dokumentation:** `docs/MASTERPLAN.md` (aktualisiert mit ALLEN Stellen)

### Zusammenfassung:

| Kategorie | Anzahl |
|-----------|--------|
| Platzhalter Bilder | 56 |
| Fehlende API Keys | 6 |
| Mock Produkte | 73 |
| Hardcoded Werte | 7 |

**Alle Details in:** `docs/MASTERPLAN.md`

---

## Feature 8: Style Quiz - Plan erstellt

**Dokumentation:** `docs/FEATURE8_STYLE_QUIZ.md`

### Konzept:
- 5 Fragen mit je 4 Bild-Optionen
- Fragen zu: Wohnzimmer-Stil, Farbpalette, Material, Atmosphäre, Lieblingsmöbel
- Ergebnis: Bevorzugter Stil (Skandinavisch, Modern, Industrial, Vintage, Boho)
- Speicherung: AsyncStorage via styleProfile.ts
- Integration: DiscoverScreen mit "Style finden" Button

### Neue Dateien:
- `src/screens/StyleQuizScreen.tsx`
- `src/components/QuizOption.tsx`
- `src/data/quizQuestions.ts`

### Geändert:
- `App.tsx` - Route hinzufügen
- `src/services/styleProfile.ts` - saveQuizResult()
- `src/screens/DiscoverScreen.tsx` - Quiz Button + Ergebnis

### Zeitplan: ~2h

---

## Feature 8: Style Quiz - Implementiert ✅

### Neue Dateien:
- `src/data/quizQuestions.ts` - 5 Fragen mit je 4 Optionen
- `src/components/QuizOption.tsx` - Bild-Option Component
- `src/screens/StyleQuizScreen.tsx` - Haupt-Screen mit Wizard-Logik

### Geänderte Dateien:
- `src/types/index.ts` - QuizAnswer, QuizResult, QuizQuestion Types
- `src/services/styleProfile.ts` - saveQuizResult(), getQuizResult(), hasCompletedQuiz()
- `App.tsx` - Route für StyleQuiz hinzugefügt
- `src/screens/DiscoverScreen.tsx` - "Style finden" Button + Ergebnis-Banner

### Features:
- 5 interaktive Fragen zu Einrichtungsstil
- Automatische Ergebnis-Berechnung
- Speicherung in AsyncStorage
- "Passende Produkte" Button im Ergebnis
- Auto-Selection des Quiz-Stils in Discover

---

## Feature 9: Budget-Modus - Implementiert ✅

### Änderungen:
- `src/screens/DiscoverScreen.tsx`
  - Budget-Chips hinzugefügt: € bis €€€€€ + Benutzerdefiniert
  - Horizontales ScrollView für Budget-Optionen
  - Custom Price Input wenn "Alle" gewählt
  - Filter-Logik aktualisiert

### Features:
- € (0-200), €€ (200-500), €€€ (500-1000), €€€€ (1000-2000), €€€€€ (2000+)
- Benutzerdefinierter Min/Max Input
- "Filter löschen" aktualisiert

---

## Feature 10: Ähnliche Produkte - Implementiert ✅

### Neue Funktion:
- `src/data/catalog.ts`: getSimilarProducts(item, limit)

### Änderungen:
- `src/screens/ResultsScreen.tsx`
  - Import getSimilarProducts
  - similarProducts state (basierend auf erstem Produkt)
  - "Das könnte dir auch gefallen" Section (horizontal ScrollView)

### Features:
- Zeigt 6 ähnliche Produkte basierend auf:
  - Gleiche Kategorie (+3 Punkte)
  - Gleicher Stil (+2 Punkte)
  - Ähnlicher Preis ±30% (+2 Punkte)
  - Gleicher Shop (+1 Punkt)

---

## Feature 11: Preis-Alarm - Implementiert ✅

### Neue Datei:
- `src/services/priceTracker.ts` - PriceTrackerService

### Methoden:
- trackProduct(product)
- untrackProduct(productId)
- getTrackedProducts()
- isTracked(productId)
- getPriceDrops()
- getPriceDropCount()

### Änderungen:
- `src/screens/ResultsScreen.tsx` - Track-Button (🔔/🔕) auf Produkten
- `src/screens/DiscoverScreen.tsx` - Track-Button auf Produkt-Karten

### Features:
- Produkte beobachten mit einem Klick
- Speicherung in AsyncStorage
- Badge-Anzeige (später für Push Notifications)

---

## Feature 12: Wunschliste teilen - Implementiert ✅

### Änderungen:
- `src/screens/FavoritesScreen.tsx`
  - Import Share
  - shareAllFavorites() Funktion
  - "📤 Wunschliste teilen" Button

### Features:
- Alle Favoriten als Text teilen
- Format: Liste mit Nummern, Namen, Preisen, Shops
