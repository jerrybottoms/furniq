# Feature 12: Wunschliste teilen - Implementierungsplan

## 🎯 Ziel

Benutzer können beobacht ihre Favoriten odereten Produkte als Liste teilen.

---

## 📱 UX/UI Konzept

### Share-Button

- Auf Favorites-Screen: "Teilen" Button in der Header
- Auf ResultsScreen: bereits vorhanden (erweitern)

### Share-Inhalt

Text-Format:
```
🛋️ Meine Möbel-Wunschliste von Furniq

❤️ Favoriten:
1. [Produktname] - [Preis] ([Shop])
2. ...

🔔 Beobachtet:
1. [Produktname] - [Preis] ([Shop])
2. ...

➡️ Entdecken: [App Link]
```

---

## 🏗️ Technische Architektur

### Bestehende Funktionalität

- ResultsScreen hat bereits shareProduct()
- FavoritesScreen hat Share-Button

### Erweitern

1. FavoritesScreen: "Alle teilen" Button
2. Share-Format: Text + Optional: Screenshot

---

## ✅ Checkliste

- [ ] FavoritesScreen: "Teilen" Button (Alle Favoriten)
- [ ] Share-Format: Liste mit Namen + Preisen
- [ ] Testen

---

## ⏱️ Geschätzt: 30 Minuten

---

*Erstellt: 2026-02-20*
