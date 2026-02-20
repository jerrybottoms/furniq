# Furniq - App Store Metadata

## Basis-Informationen

| Feld | Wert |
|------|------|
| **App Name** | Furniq |
| **Bundle ID** | com.furniq.app |
| **Version** | 1.0.0 |
| **Kategorie** | Shopping |
| **Plattformen** | iOS (TestFlight später), Android |

---

## Beschreibung (Deutsch)

### Kurzbeschreibung (max 30 Zeichen)
```
🪑 Finde ähnliche Möbel
```

### Vollständige Beschreibung (max 4000 Zeichen)
```
Furniq - Dein persönlicher Möbel-Finder

🔍 So einfach geht's:
1. Fotografiere Möbel oder lade Screenshots hoch
2. Unsere KI analysiert Stil, Material und Kategorie
3. Finde ähnliche Produkte von Top-Shops

✨ Funktionen:
• KI-gestützte Möbelerkennung
• Preisvergleich von多家 Shops
• Favoriten speichern
• Suchverlauf (geräteübergreifend mit Account)
• Filter nach Preis und Shop
• Share-Funktion

🇩🇪🇦🇹🇨🇭 Optimiert für Deutschland, Österreich, Schweiz
🇺🇸🇬🇧 Auch verfügbar für USA und UK

Datenschutz: Deine Daten werden sicher in Deutschland gespeichert (Supabase, EU).
```

---

## Keywords (max 100 Zeichen, durch Komma getrennt)

```
Möbel, Einrichtung, Shopping, Preisvergleich, IKEA, Otto, home24, Westwing, Mömax, XXXLutz, Skandinavisch, Modern, Vintage, Einrichten, Interior Design, Home Decor, Furniture, Shopping App
```

---

## Screenshots-Anforderungen

| Gerät | Größe | Anzahl |
|--------|-------|--------|
| iPhone 6.7" | 1290 x 2796 px | 2-3 |
| iPhone 6.5" | 1242 x 2688 px | 2-3 |
| iPad | 2048 x 2732 px | 2-3 |

### Screenshot-Inhalte (Platzhalter)
1. **Home:** Kamera-Button + "Foto aufnehmen"
2. **Results:** Produktliste mit Preisen
3. **Onboarding:** Die 3 Feature-Screens

---

## App Icons (erforderlich)

| Größe | Verwendung |
|-------|------------|
| 1024 x 1024 | App Store (wird skaliert) |
| 180 x 180 | iPhone @3x |
| 120 x 120 | iPhone @2x |
| 167 x 167 | iPad Pro |

---

## Prerequisite-Checks

- [ ] Apple Developer Account (€99/Jahr)
- [ ] App Icon 1024x1024
- [ ] Screenshots (2-3 pro Gerät)
- [ ] Datenschutzerklärung (URL)
- [ ] Impressum (URL)
- [ ] Support-URL

---

## Build-Befehle

### iOS (TestFlight)
```bash
pnpm exec expo prebuild --platform ios
eas build -p ios --profile development
```

### Android (APK)
```bash
pnpm exec expo prebuild --platform android
eas build -p android --profile development
```

---

## Affiliate-Shops (AWIN)

- Otto (DE)
- home24 (DE)
- Westwing (DE)
- Mömax (DE/AT)
- XXXLutz (DE/AT)
- Etsy (DE/AT/CH)
- Wayfair (US/UK only)
- Amazon (alle Länder)
- IKEA (alle Länder)
