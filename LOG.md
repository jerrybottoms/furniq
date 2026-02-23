# Furniq — Change Log

## 2026-02-21 — Nacht-Review & Cleanup (Jerry)

### 🐛 Bug Fixes

1. **Onboarding Logic Inverted (CRITICAL)**
   - **File:** `App.tsx`
   - **Problem:** `AsyncStorage.getItem` returned 'true' when onboarding was already seen, but the condition showed onboarding when `showOnboarding === true` — meaning it showed onboarding to returning users and skipped it for first-timers.
   - **Fix:** Changed `val === 'true'` to `val !== 'true'` so `showOnboarding` is true for first launch (no stored value) and false for returning users.

2. **React Hooks Called Conditionally (CRITICAL)**
   - **File:** `src/screens/ProductDetailScreen.tsx`
   - **Problem:** `useState` and `useRef` hooks were called after an early return for `!productId`, violating React's Rules of Hooks. This could cause crashes or inconsistent behavior.
   - **Fix:** Moved all hooks before the early return. Added `if (!productId) return;` guard inside `useEffect` instead.

3. **Chinese Character in Text**
   - **File:** `src/screens/StyleQuizScreen.tsx`
   - **Problem:** Industrial style description contained "und动手 mit Charakter" (Chinese characters).
   - **Fix:** Changed to "und mit echtem Charakter".

### 🧹 Cleanup

4. **Leading Spaces in Product Names**
   - **File:** `src/data/catalog.ts`
   - **Fixed:** ' Milano Ledersofa' → 'Milano Ledersofa', ' Loft Tisch' → 'Loft Tisch'

5. **Unused Variables**
   - **File:** `src/screens/AuthScreen.tsx`
   - **Fixed:** Removed unused `user` destructuring from `signUp()` and `signIn()` calls.

### 📝 Documentation

6. **Test Plan Created**
   - **File:** `docs/TESTPLAN.md`
   - Comprehensive test plan covering all 11 feature areas (Home, Discover, Favorites, Settings, Style Quiz, Auth, Product Detail, Results, Onboarding, Navigation, Supabase).

### ✅ Build Verification

- Web bundle compiled successfully: 602 modules, 1748ms, no errors.
- `npx expo start --web --port 8090` — clean start, no warnings.

### ⚠️ Known Issues (Not Fixed — Need Discussion)

1. **Country type mismatch:** `supabase.ts` defines `Country` with 'OTHER' but `Settings` type only allows 'DE'|'AT'|'CH'|'US'|'UK'. Low priority since 'OTHER' is only used internally as fallback.

2. **Browser testing not possible:** Chrome extension relay not attached — couldn't do interactive UI testing. Recommend Max tests manually on web or device.

3. **Mock data only:** All product searches return mock data. OpenAI Vision API key not configured — falls back to mock analysis. This is expected for development.

4. **Dark Mode & Notifications:** Both switches are disabled in Settings. Marked as "in Entwicklung".
