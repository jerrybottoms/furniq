# Furniq App — Testplan

_Erstellt: 2026-02-21_

## 1. Home Screen
- [ ] App startet ohne Crash
- [ ] Titel "🪑 Furniq" und Subtitle sichtbar
- [ ] Quick Actions (Favoriten, Anmelden, Einstellungen) sichtbar und navigieren korrekt
- [ ] "Take Photo" Button vorhanden (Kamera-Permission auf Web nicht verfügbar)
- [ ] "Gallery" Button öffnet Image Picker
- [ ] "Mehrere Bilder" Button vorhanden
- [ ] Suchverlauf wird angezeigt (wenn vorhanden)
- [ ] Nach Bildauswahl: Thumbnail sichtbar, X-Button zum Entfernen
- [ ] "Find Similar" Button erscheint nach Bildauswahl
- [ ] Analyse-Flow: Statustext → Results Screen Navigation

## 2. Discover Screen (Entdecken)
- [ ] Tab "Entdecken" navigiert korrekt
- [ ] Header mit Titel und Produktanzahl
- [ ] Style-Chips (Skandinavisch, Modern, etc.) filterbar
- [ ] Kategorie-Chips (Sofa, Stuhl, etc.) filterbar
- [ ] Budget-Chips filterbar
- [ ] Custom Price Range Eingabe funktioniert
- [ ] "Filter löschen" setzt alle Filter zurück
- [ ] Produktkarten zeigen Bild, Name, Preis, Shop
- [ ] Tap auf Produkt → ProductDetail Screen
- [ ] Track-Button (🔔/🔕) togglet korrekt
- [ ] Style Quiz Button navigiert zum Quiz
- [ ] Quiz-Banner erscheint nach Quiz-Completion
- [ ] "Für dich" Section bei vorhandenen Empfehlungen

## 3. Favoriten Screen
- [ ] Tab "Favoriten" navigiert korrekt
- [ ] Empty State mit Herz-Emoji und "Jetzt suchen" Button
- [ ] Favoriten werden als Karten angezeigt (Bild, Name, Preis, Shop)
- [ ] "Zum Shop" Button vorhanden
- [ ] Long-Press auf Favorit → Lösch-Dialog
- [ ] "Wunschliste teilen" Button funktioniert (Share Sheet)
- [ ] Pull-to-Refresh lädt Favoriten neu

## 4. Einstellungen Screen
- [ ] Tab "Einstellungen" navigiert korrekt
- [ ] Land-Auswahl: 5 Länder angezeigt (DE, AT, CH, US, UK)
- [ ] Aktives Land hervorgehoben (grün)
- [ ] Land-Wechsel wird gespeichert
- [ ] Dark Mode Switch vorhanden (disabled)
- [ ] Benachrichtigungen Switch vorhanden (disabled)
- [ ] Datenschutz-Link vorhanden
- [ ] Impressum-Link vorhanden
- [ ] "Einstellungen zurücksetzen" zeigt Confirm-Dialog
- [ ] Version "Furniq v1.0.0" angezeigt

## 5. Style Quiz
- [ ] Navigation via Discover → Quiz Button
- [ ] Intro Screen mit Features und "Quiz starten" Button
- [ ] 5 Fragen mit je 4 Bild-Optionen
- [ ] Progress Bar aktualisiert sich
- [ ] Zurück-Button geht zur vorherigen Frage
- [ ] Auswahl markiert Option (grüner Rand + Checkmark)
- [ ] Nach 5 Fragen → Result Screen
- [ ] Result zeigt Stil mit Emoji und Beschreibung
- [ ] "Passende Produkte entdecken" → Discover Screen
- [ ] "Quiz wiederholen" startet neu

## 6. Auth Screen
- [ ] Navigation via Home → Anmelden
- [ ] Email und Passwort Felder vorhanden
- [ ] Toggle zwischen Anmelden/Registrieren
- [ ] Validierung: leere Felder → Fehler
- [ ] Validierung: Passwort < 6 Zeichen → Fehler
- [ ] "Mit Google anmelden" Button vorhanden
- [ ] Loading State bei Submit

## 7. Product Detail Screen
- [ ] Navigation via Discover/Favoriten → Produktkarte
- [ ] Hero Image/Placeholder angezeigt
- [ ] Back-Button (←) navigiert zurück
- [ ] Share-Button (↗) öffnet Share Sheet
- [ ] Shop Badge mit korrekter Farbe
- [ ] Produktname, Style, Kategorie Tags
- [ ] Preis mit "inkl. MwSt."
- [ ] Beschreibung mit "Mehr anzeigen"/"Weniger anzeigen"
- [ ] Ähnliche Produkte Carousel
- [ ] Tap auf ähnliches Produkt → neues ProductDetail
- [ ] Sticky Action Bar: Merken (❤️), Preisalarm (🔔), "Zum Shop"
- [ ] Favorit-Toggle funktioniert

## 8. Results Screen
- [ ] Zeigt analysiertes Bild und erkannte Tags
- [ ] Confidence Bar mit Prozentzahl
- [ ] Shop-Filter Chips
- [ ] Sort-Optionen (Relevanz, Preis ↑, Preis ↓)
- [ ] Preis-Filter Panel
- [ ] Produktkarten mit Favorit, Track, Share Buttons
- [ ] "Zum Shop" Button auf jeder Karte
- [ ] "Neue Suche" Button
- [ ] "Das könnte dir auch gefallen" Section
- [ ] Empty State wenn keine Ergebnisse

## 9. Onboarding
- [ ] Erster App-Start zeigt Onboarding (3 Seiten)
- [ ] Swipen zwischen Seiten
- [ ] Dots-Indikator aktualisiert sich
- [ ] "Überspringen" Button sichtbar
- [ ] "Weiter" → nächste Seite
- [ ] Letzte Seite: "Loslegen!" → Main App
- [ ] Zweiter App-Start: kein Onboarding

## 10. Navigation
- [ ] Bottom Tabs: Home, Entdecken, Favoriten, Einstellungen
- [ ] Tab-Icons korrekt (🏠, 🔍, ❤️, ⚙️)
- [ ] Aktiver Tab hervorgehoben (grün)
- [ ] Stack Navigation: Results, Auth, StyleQuiz, ProductDetail
- [ ] Modal-Presentation für Auth und StyleQuiz
- [ ] Back-Navigation funktioniert überall

## 11. Supabase Integration
- [ ] App startet auch ohne Supabase-Verbindung (Fallback auf Local Storage)
- [ ] Favoriten werden lokal gespeichert (ohne Login)
- [ ] Settings werden in AsyncStorage gespeichert
- [ ] History wird in AsyncStorage gespeichert
