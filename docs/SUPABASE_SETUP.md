# Supabase Setup Plan

## 🎯 Ziel
Supabase einrichten für:
- Favoriten-Sync (geräteübergreifend)
- Style Profile speichern
- Suchhistorie

---

## Phase 1: Supabase Projekt erstellen (Account)

**Zeit:** ~15 min

1. **Account erstellen:** https://supabase.com
2. **Neues Projekt:**
   - Organization: "Furniq" (oder dein Name)
   - Name: `furniture-finder`
   - Database Password: **Merken!**
   - Region: `EU (Frankfurt)` — nearest to Germany

3. **Warten** bis Projekt ready ist (~2 min)

---

## Phase 2: Datenbank Schema erstellen

**Zeit:** ~10 min

### SQL ausführen im Supabase SQL Editor:

```sql
-- 1. favorites Tabelle
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  furniture_item JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. search_history Tabelle
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS) - WICHTIG!
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- 4. Policies (User können nur ihre eigenen Daten sehen)
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Index für bessere Performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
```

---

## Phase 3: Credentials in .env eintragen

**Zeit:** ~5 min

1. **Supabase Dashboard → Settings → API**
2. **Copy:**
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - anon public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. **In .env eintragen:**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **.env reloaden:**
```bash
cd furniture-finder
source .env
```

---

## Phase 4: Testen

**Zeit:** ~10 min

1. **Auth testen:**
   - Sign Up mit Test-Email
   - Confirm Email im Supabase Dashboard

2. **Favoriten testen:**
   - Produkt zu Favoriten hinzufügen
   - Supabase Dashboard → Table Editor → favorites prüfen

---

## ⏱️ Geschätzter Aufwand

| Phase | Zeit |
|-------|------|
| Account + Projekt | 15 min |
| SQL Schema | 10 min |
| Credentials | 5 min |
| Testen | 10 min |
| **Gesamt** | **~40 min** |

---

## 🔗 Links

- Supabase: https://supabase.com
- Docs: https://supabase.com/docs
- SQL Editor: https://app.supabase.com/project/_/sql

---

## ✅ Checkliste nach Fertig

- [ ] Supabase Projekt erstellt
- [ ] .env mit echten Credentials
- [ ] SQL Schema ausgeführt
- [ ] RLS Policies aktiv
- [ ] Erster User kann sich registrieren
- [ ] Favoriten werden in DB gespeichert
