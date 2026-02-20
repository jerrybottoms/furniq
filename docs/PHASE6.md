# Phase 6: TestFlight Preparation

## 1. Apple Developer Account

**Kosten:** €99/Jahr (Apple Developer Program)

**Registrierung:**
1. https://developer.apple.com/enroll/
2. Apple ID erstellen (falls nicht vorhanden)
3. €99/Jahr bezahlen
4. Team erstellen

## 2. Bundle Identifier

**Aktuell in app.json:**
- iOS: `com.furniturefinder.app`
- Android: `com.furniturefinder.app`

**In Apple Developer Portal registrieren:**
1. https://developer.apple.com/account
2. Certificates, Identifiers & Profiles
3. Identifiers → New Bundle ID
4. `com.furniturefinder.app` registrieren

## 3. EAS Setup (Expo)

### Schritt 1: Expo Account
```bash
eas login
```

### Schritt 2: Projekt konfigurieren
```bash
cd furniture-finder
eas project:init
```

### Schritt 3: eas.json erstellen
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "enterprise": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

## 4. Build Commands

### Preview Build (Simulator)
```bash
eas build -p ios --profile preview
```

### Production Build (TestFlight)
```bash
eas build -p ios --profile production
```

### Android APK (Direkt)
```bash
eas build -p android --profile preview
```

## 5. TestFlight Workflow

1. **Build hochladen:**
   ```bash
   eas build --platform ios
   ```

2. **Automatisch zu TestFlight:**
   - Nach erfolgreichem Build
   - In App Store Connect verfügbar

3. **Tester einladen:**
   - App Store Connect → TestFlight
   - Internal Testing (max 100)
   - External Testing (max 10.000)

## 6. Benötigte Credentials

| Credential | Woher | Status |
|------------|-------|--------|
| Apple Developer Account | apple.com | ❌ Nicht vorhanden |
| Bundle Identifier | App Store Connect | ⏳ Wartet auf Account |
| Certificates | Xcode/EAS | ⏳ Nach Account |
| App Store Connect App | App Store Connect | ⏳ Nach Account |

## 7. Nächste Schritte

1. **Apple Developer Account registrieren** (€99/Jahr)
2. `eas login` auf Mac ausführen
3. `eas project:init` ausführen
4. Bundle Identifier in Apple Portal registrieren
5. Ersten Build starten

---

## Alternative: Android APK (ohne Account)

Falls du erstmal ohne Apple Account testen willst:
```bash
eas build -p android --profile preview
```
→ Erstellt APK, kann direkt auf Android installiert werden
