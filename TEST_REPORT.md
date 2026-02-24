# Furniq App Test Report

**Test Datum:** 2026-02-24
**Tester:** Jerry (via iOS Simulator + Maestro)
**Build:** Debug iOS Simulator (Standalone, nicht Dev Client)
**Simulator:** iPhone 17 Pro, iOS 26.2

---

## ✅ Getestete Screens & Funktionen

### 1. Onboarding Flow (3 Steps)
- [x] Step 1: "Fotografieren" - Kamera Icon
- [x] Step 2: "KI-Analyse" - Lupe Icon  
- [x] Step 3: "Vergleichen" - Einkaufswagen Icon
- [x] "Weiter" / "Überspringen" Buttons funktionieren
- [x] "Loslegen!" completion

### 2. Home Screen
- [x] Header: 🪑 Furniq Logo + Tagline
- [x] Foto-Upload Bereich (grauer Platzhalter)
- [x] "Take Photo" Button (teal)
- [x] "Gallery" Button (grau)
- [x] "Mehrere Bilder" Button (lila)
- [x] Bottom Navigation (4 Tabs)

### 3. Discover/Products Screen
- [x] Header mit 🔍 Search Icon
- [x] "Keine Ergebnisse" Empty State
- [x] Kategorien Grid: Sofa, Stuhl, Tisch, Lampe, Regal, Bett, Bad, Deko
- [x] Navigation funktioniert

### 4. Favorites Screen
- [x] Header: "Favoriten"
- [x] Empty State: "Noch keine Favoriten" + Herz-Icon Anleitung
- [x] Navigation funktioniert

### 5. Settings Screen
- [x] Header: "Einstellungen"
- [x] Profil-Sektion: Name + Email
- [x] Dark Mode Toggle (UI vorhanden, noch nicht getestet)
- [x] Budget-Modus Anzeige (500€)
- [x] "Stil Quiz starten" Button (lila)
- [x] Sprache: Deutsch
- [x] Benachrichtigungen: Aus
- [x] Version: 1.0.0
- [x] Footer: "Made with ❤️ in Germany"

---

## ❌ Probleme & Bugs

### 1. Deep Link Dialog (KRITISCH)
**Problem:** Beim Starten der App erscheint immer wieder der "Open in Furniq?" Dialog. Dies passiert durch einen Deep Link der durch `expo-run:ios` getriggert wird.

**Reproduktion:** 
- App starten → Dialog erscheint
- Auf "Open" tippen → App öffnet sich
- Beim Navigieren zwischen Tabs erscheint der Dialog erneut

**Lösung:** 
- Für Production-Build: Dieser Dialog erscheint nicht (nur im Dev-Modus)
- Alternativ: Deep Link Schema aus der App-Configuration entfernen für Testing

### 2. Maestro Tap-Koordinaten (GERING)
**Problem:** Taps auf x,y Koordinaten funktionieren nicht zuverlässig. Die App reagiert nicht auf Koordinaten-Taps.

**Mögliche Ursache:**
- Koordinaten-System stimmt nicht überein
- Simulator-Skalierung

**Workaround:** Text-basierte Taps (tapOn: "Button Text") funktionieren besser

### 3. Expo Dev Menu Overlay (GERING)
**Problem:** Beim Start erscheint manchmal das Expo Dev Menu Overlay über der App.

**Lösung:** "Continue" oder "X" tippen um es zu schließen

---

## 📋 Geplante Fixes

### Priorität 1 (Kritisch)
- [ ] Deep Link Dialog entfernen oder unterdrücken für Testing
- [ ] Product Detail Screen testen (fehlt noch)

### Priorität 2 (Wichtig)
- [ ] Style Quiz testen
- [ ] Dark Mode Toggle testen
- [ ] Budget-Modus testen

### Priorität 3 (Nice to Have)
- [ ] Suchfunktion testen
- [ ] Kategorie-Filter testen
- [ ] Foto-Upload testen (braucht Kamera-Zugriff)

---

## 📸 Screenshots

Alle Screenshots gespeichert in: `~/.openclaw/media/furniq_*.png`

- `furniq_onboarding.png` - Onboarding Step 1
- `furniq_onboarding_2.png` - Onboarding Step 2  
- `furniq_onboarding_3.png` - Onboarding Step 3
- `furniq_home_real.png` - Home Screen
- `furniq_discover3.png` - Discover/Products Screen
- `furniq_favorites.png` - Favorites (Empty)
- `furniq_settings.png` - Settings Screen

---

## Model: minimax/MiniMax-M2.5
