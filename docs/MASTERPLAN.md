# Furniq Masterplan - Komplette Mock Daten Liste

## 🚨 ALLE Mock Daten & fehlende API Keys

### Bilder (56x placehold.co)

| # | Datei | Anzahl | Art |
|---|-------|--------|-----|
| 1 | `src/services/productSearch.ts` | 23 | Produkt-Bilder (Amazon, IKEA, Wayfair, AWIN Shops) |
| 2 | `src/data/catalog.ts` | 50 | Entdecken Katalog Bilder |
| 3 | `src/services/imageAnalysis.ts` | 1 | Fallback Mock Analyse |

---

### API Keys (.env)

| # | Key | Status | Aktion |
|---|-----|--------|--------|
| 4 | `EXPO_PUBLIC_SUPABASE_URL` | ❌ LEER | Supabase Projekt erstellen |
| 5 | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ❌ LEER | Aus Supabase Dashboard holen |
| 6 | `EXPO_PUBLIC_OPENAI_API_KEY` | ✅ Vorhanden | - |
| 7 | `EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY` | ❌ LEER | Optional (für Google Vision) |
| 8 | `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` | ❌ LEER | Amazon Associate beantragen |
| 9 | `EXPO_PUBLIC_AWIN_ID` | ❌ FEHLT | AWIN Publisher Account |

---

### Produkt-Daten (73 Mock Produkte)

| # | Quelle | Datei | Produkte | Bilder |
|---|--------|-------|----------|--------|
| 10 | Amazon Suche | `productSearch.ts` | 6 | 6x placehold |
| 11 | IKEA Suche | `productSearch.ts` | 6 | 6x placehold |
| 12 | Wayfair Suche | `productSearch.ts` | 6 | 6x placehold |
| 13 | Otto (AWIN) | `productSearch.ts` | 3 | 3x placehold |
| 14 | home24 (AWIN) | `productSearch.ts` | 2 | 2x placehold |
| 15 | Westwing (AWIN) | `productSearch.ts` | 2 | 2x placehold |
| 16 | Mömax (AWIN) | `productSearch.ts` | 2 | 2x placehold |
| 17 | XXXLutz (AWIN) | `productSearch.ts` | 2 | 2x placehold |
| 18 | Etsy (AWIN) | `productSearch.ts` | 2 | 2x placehold |
| 19 | **Entdecken Katalog** | `catalog.ts` | **50** | **50x placehold** |

---

### Hardcoded Werte

| # | Datei | Wert | Problem |
|---|-------|------|---------|
| 20 | `productSearch.ts` | `AWIN_ID = 'furniturefinder'` |Placeholder ID - muss echte AWIN ID |
| 21 | `productSearch.ts` | `AMAZON_TAG = 'furniturefinder'` |Placeholder Tag |
| 22 | `productSearch.ts` | `mid=12345` (Zeile 159) |Fallback Shop ID |
| 23 | `supabase.ts` | `supabaseUrl = 'placeholder.supabase.co'` |Fallback URL |
| 24 | `supabase.ts` | `supabaseAnonKey = 'placeholder-key'` |Fallback Key |
| 25 | `imageAnalysis.ts` | `getMockAnalysis()` Fallback |Wird genutzt wenn kein OpenAI Key |

---

### Konfiguration & Konstanten

| # | Datei | Wert | Problem |
|---|-------|------|---------|
| 26 | `.env` | Alle Keys fehlen oder leer | Müssen ausgefüllt werden |
| 27 | `supabase.ts` | 3 Hardcoded Länder: DE, AT, CH | Erweiterbar für US/UK |

---

## 📊 Zusammenfassung

| Kategorie | Anzahl |
|-----------|--------|
| **Platzhalter Bilder** | 56 |
| **Fehlende API Keys** | 6 |
| **Mock Produkte** | 73 |
| **Hardcoded Werte** | 7 |
| **Fallback Funktionen** | 2 |

---

## ✅ Checkliste: Was muss gemacht werden

### Phase 1: API Keys einrichten

- [ ] 1. Supabase Projekt erstellen + Keys eintragen
- [ ] 2. AWIN Publisher Account beantragen → ID eintragen
- [ ] 3. Amazon Associate Account → Tag eintragen
- [ ] 4. Google Cloud (optional) → falls Google Vision gewünscht

### Phase 2: Produkt-Daten ersetzen

- [ ] 5. productSearch.ts: 23 Mock Produkte → Echte APIs
- [ ] 6. catalog.ts: 50 Mock Produkte → AWIN Feed
- [ ] 7. AWIN Product Feed beantragen (löst 6 Shops auf einmal)

### Phase 3: Hardcoded Werte

- [ ] 8. AWIN_ID durch echte ID ersetzen
- [ ] 9. AMAZON_TAG durch echten Tag ersetzen
- [ ] 10. Fallback URL/Keys aus supabase.ts entfernen
- [ ] 11. imageAnalysis.ts: Mock Fallback durch echte Analyse ersetzen

---

## 🔗 Wo API Keys herbekommen

| Service | URL | Kosten |
|---------|-----|--------|
| Supabase | supabase.com | Kostenlos (Free Tier) |
| AWIN | publishers.awin.com | Kostenlos |
| Amazon Associates | affiliate-program.amazon.com | Kostenlos |
| OpenAI | platform.openai.com | Pay-per-use (~$5 Testguthaben) |
| Google Cloud | console.cloud.google.com | Pay-per-use |

---

## 📁 Dateien mit Mock Daten

```
src/
├── services/
│   ├── productSearch.ts      ← 23 Mock Produkte + placeholders
│   ├── imageAnalysis.ts     ← 1 Mock Analyse Fallback
│   └── supabase.ts          ← Fallback URL/Keys
├── data/
│   └── catalog.ts           ← 50 Mock Produkte
└── .env                     ← 6 fehlende/leere Keys
```

---

*Zuletzt aktualisiert: 2026-02-20*
