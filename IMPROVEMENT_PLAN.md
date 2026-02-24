# Furniq App - Test Report & Improvement Plan

**Datum:** 24.02.2026 | **Tester:** Jerry (iOS Simulator + Maestro)

---

## 🎯 Test-Zusammenfassung

### ✅ Funktioniert (Verified)
| Screen | Status | Notes |
|--------|--------|-------|
| Onboarding | ✅ | Alle 3 Steps durchgeklickt |
| Home Screen | ✅ | Upload-Bereich, 3 Buttons, Nav |
| Discover/Products | ✅ | Kategorien-Grid, Search-Icon |
| Favorites (leer) | ✅ | Empty State korrekt |
| Settings | ✅ | Profil, Dark Mode UI, Budget, Quiz-Button |
| Tab-Navigation | ✅ | Zwischen Tabs wechseln möglich |

### ⚠️ Probleme Identifiziert

| Problem | Priorität | Ursache |
|---------|-----------|---------|
| Deep Link Dialog | 🔴 Kritisch | `expo-run:ios` trigger, erscheint bei jedem Tab-Wechsel |
| Tap-Koordinaten | 🟡 Mittel | Maestro-Taps auf x,y funktionieren nicht zuverlässig |
| Expo Dev Menu | 🟢 Gering | Overlay beim Start, manuell schließen |

---

## 📋 Verbesserungs-Plan

### Phase 1: Bug Fixes (Kritisch)

#### 1. Deep Link Dialog unterdrücken
**Problem:** Der "Open in Furniq?" Dialog erscheint bei jedem Start und nach jedem Tab-Wechsel.

**Lösung:**
```bash
# In app.json/app.config.js:
# Unter "scheme"暂时的 deaktivieren für Testing
# Oder: 
# xcrun simctl terminate booted com.furniq.app
# Dann ohne deep-link starten
```

**Aufwand:** 30 Min

---

### Phase 2: Features Testen (Wichtig)

#### 2. Style Quiz testen
- [ ] Button in Settings scrollen und antippen
- [ ] Quiz durchklicken (3-5 Fragen)
- [ ] Ergebnis speichern

#### 3. Dark Mode Toggle
- [ ] In Settings: Toggle antippen
- [ ] UI wechselt zu Dark Theme
- [ ] Datenbank speichert Preference

#### 4. Budget-Modus
- [ ] Budget ändern
- [ ] Produkte werden nach Budget gefiltert

#### 5. Produkt-Detail Screen
- [ ] Produkt antippen → Detail Screen
- [ ] Alle Infos anzeigen (Preis, Lieferung, etc.)
- [ ] "Auf Amazon suchen" Button

---

### Phase 3: Neue Features (Nice to Have)

- [ ] Similar Products UI
- [ ] Preishistorie-Grafik
- [ ] Moodboard Export
- [ ] Echte API (AWIN + Amazon)

---

## 🚀 Nächste Schritte

1. **Sofort:** Deep Link Fix → kann dann richtig testen
2. **Dann:** Restliche Features durchtesten
3. **Abschließend:** Bug-Report an Max

---

## Model: minimax/MiniMax-M2.5
