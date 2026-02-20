# Security Documentation

## Übersicht
Diese Dokumentation beschreibt die Sicherheitsmaßnahmen der Furniture Finder App.

---

## 🔐 Authentifizierung

### Supabase Auth
- **Verschlüsselung:** Supabase verwendet JWT (JSON Web Tokens)
- **Password Hashing:**bcrypt (industry standard)
- **Token Storage:** iOS Keychain via SecureStore
- **OAuth:** Google OAuth 2.0 (von Google verwaltet)

### Token Storage
```
iOS: SecureStore → Keychain (verschlüsselt)
Android: SecureStore → EncryptedSharedPreferences
```

---

## 📱 Lokale Daten

### AsyncStorage (Favoriten)
- **iOS:** Daten werden verschlüsselt im App-Sandbox gespeichert
- **Nicht verschlüsselt:** Für sensible Daten (Auth Tokens) wird SecureStore verwendet
- **Favoriten:** Lokal gespeicherte Favoriten sind nicht verschlüsselt (wenig sensibel)

### Was wird lokal gespeichert:
- Favoriten (Produktname, Preis, Bild-URL, Affiliate-Link)
- Auth-Session (in Keychain)

---

## 🗄️ Supabase Datenbank

### Row Level Security (RLS)
**WICHTIG:** Diese Policies müssen in Supabase Dashboard eingerichtet werden:

```sql
-- Favoriten: Nur eigener User darf seine Favoriten sehen
CREATE POLICY "Users can view own favorites"
ON favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
ON favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Search History: Nur eigener User
CREATE POLICY "Users can view own history"
ON search_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
ON search_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Anonyme Nutzer
- Können die App nutzen ohne Account
- Favoriten werden nur lokal gespeichert
- Keine Daten werden an Server gesendet

---

## 🌐 API Keys

### EXPO_PUBLIC_* Keys
Diese Keys sind im App-Bundle sichtbar (notwendig für Client-seitige APIs):
- `EXPO_PUBLIC_SUPABASE_URL` - öffentlich, kein Problem
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - öffentlich, nur für anonymen Zugriff
- `EXPO_PUBLIC_OPENAI_API_KEY` - ⚠️ **Nicht empfohlen!** 
  - Besser: Edge Function oder Proxy Server
- `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` - öffentlich, Affiliate-ID

### Sicherheits-Empfehlung für Production:
1. **OpenAI API:** Nicht direkt in App → Edge Function oder Serverless Proxy
2. **Supabase:** Anon Key ist OK, aber RLS aktivieren!
3. **Amazon:** Associate Tag ist öffentlich, kein Problem

---

## 🛡️ Sicherheits-Checkliste

### Vor Launch:
- [ ] Supabase RLS Policies einrichten
- [ ] OpenAI API durch Proxy absichern (oder Budget limits setzen)
- [ ] HTTPS erzwingen (Supabase macht das automatisch)
- [ ] Rate Limiting aktivieren (Supabase Pro)

### Optional:
- [ ] Zwei-Faktor-Authentifizierung
- [ ] Email-Verifikation erzwingen
- [ ] Account-Deletion (GDPR)

---

## 📊 Datenschutz (DSGVO)

### Was gesammelt wird:
- Email (bei Registrierung)
- Favoriten (selbst eingegeben)
- Suchverlauf (nur bei eingeloggtem User)

### Rechte der Nutzer:
- Auskunft über gespeicherte Daten
- Löschen der Daten (Account löschen)
- Daten-Export

---

## 🔒 Security Best Practices

1. **Keine sensiblen Daten in AsyncStorage** → SecureStore verwenden
2. **RLS Policies** → Immer aktivieren!
3. **API Keys** → EXPO_PUBLIC nur für nicht-sensible Keys
4. **User Input** → Validieren und sanitieren
5. **HTTPS** → Immer erzwingen
