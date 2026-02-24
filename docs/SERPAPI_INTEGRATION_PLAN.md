# SerpAPI Integration Plan — Echte Produkte für Furniq

## Ziel
Mock-Daten durch echte Google Shopping Ergebnisse ersetzen via SerpAPI.

## Architektur

```
Bild → GPT-4o Vision → Keywords + Kategorie
                              ↓
                    realProductSearch.ts
                              ↓
                    SerpAPI Google Shopping
                              ↓
                    Map to FurnitureItem format
                              ↓
                       ResultsScreen (keine Änderung nötig)
```

## Dateien

### Neu erstellen:
1. **`src/services/serpApiSearch.ts`** — Hauptservice
   - `searchProducts(query: string, options?: SearchOptions): Promise<FurnitureItem[]>`
   - Google Shopping Endpoint: `https://serpapi.com/search?engine=google_shopping`
   - Parameter: `q` (Suchbegriff), `location=Germany`, `hl=de`, `gl=de`
   - Response mappen auf `FurnitureItem` Format (id, name, price, currency, shop, imageUrl, affiliateUrl)
   - Error handling + Fallback auf Mock-Daten wenn API-Limit

2. **`src/services/productSearchRouter.ts`** — Router/Fallback
   - Prüft ob SERPAPI_KEY vorhanden
   - Ja → serpApiSearch
   - Nein → bisheriger Mock-productSearch (Fallback)

### Ändern:
3. **`src/services/productSearch.ts`** — `searchSimilarProducts()` aufrufen über Router statt direkt Mock
4. **`.env`** — `EXPO_PUBLIC_SERPAPI_KEY=` (leer, Max trägt Key ein)
5. **`src/types/index.ts`** — ggf. SerpAPI Response Types

## SerpAPI Google Shopping Response Format
```json
{
  "shopping_results": [
    {
      "position": 1,
      "title": "IKEA POÄNG Sessel",
      "link": "https://...",
      "product_link": "https://...",
      "source": "IKEA",
      "price": "€99.00",
      "extracted_price": 99.0,
      "thumbnail": "https://...",
      "rating": 4.5,
      "reviews": 234
    }
  ]
}
```

## Mapping auf FurnitureItem
```typescript
{
  id: `serp_${position}`,
  name: title,
  price: extracted_price,
  currency: 'EUR',
  shop: source,  // "IKEA", "Amazon", "Otto" etc.
  imageUrl: thumbnail,
  affiliateUrl: link,
  rating: rating,
  reviews: reviews,
  description: '', // nicht von SerpAPI
  category: analysis.category, // von GPT-4o
  style: analysis.style,
}
```

## Suchquery-Strategie
Die AI-Analyse liefert:
- `category`: "Sessel", "Stuhl", etc.
- `style`: "modern", "skandinavisch", etc.
- `material`: "Leder", "Holz", etc.
- `searchTerms`: ["modern leather chair", ...]

→ Query: `searchTerms[0]` oder `"${category} ${style} ${material}"` auf Deutsch

## Env Variable
```
EXPO_PUBLIC_SERPAPI_KEY=         # Max muss eintragen
```

## Fallback-Logik
1. Key vorhanden + API erreichbar → echte Produkte
2. Key fehlt oder API-Error → Mock-Daten (wie bisher)
3. Rate Limit (100/Monat free) → Mock-Daten + Info-Banner

## Kein Breaking Change
- FurnitureItem Interface bleibt gleich
- ResultsScreen, ProductDetailScreen, FavoritesScreen brauchen keine Änderung
- Alles abwärtskompatibel
