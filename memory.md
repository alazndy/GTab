# GTab Memory

## Son Durum
- Tarih: 2026-04-29
- Aktif agent: Claude
- Versiyon: **4.3.0**
- Build sistemi: **İki edition** — `pnpm build` (personal) / `pnpm build:store` (store)

## Claude
### Yaptıkları
- **v4.3.0 — Yeni Widget'lar + Store Hazırlığı:**
  - **Weather Widget:** Open-Meteo API (API key gereksiz), Nominatim reverse geocoding, 30dk cache, sıcaklık/nem/rüzgar/hissedilen gösterimi.
  - **Pomodoro Widget:** 25/5/15dk fazları, SVG ring animasyonu, session sayacı, tarayıcı bildirimi.
  - **Spotify Widget:** OAuth implicit flow (chrome.identity), now playing, play/pause/next/prev kontrolleri, client ID kurulum ekranı.
  - **manifest.json:** tasks.googleapis.com, Open-Meteo, Nominatim, Spotify host permissions eklendi. Tasks OAuth scope eklendi.
  - **WidgetId:** weather, pomodoro, spotify tipleri eklendi. DEFAULT_LAYOUT'a eklendi.

- **v4.2.5 — OAuth & Google Tasks Fixes:**
  - **Google Tasks Widget:** iframe → Tasks REST API'ye geçiş (Gmail gibi). REAUTH_REQUIRED, API_NOT_ENABLED hata tespiti. forceConsent=true mekanizması.
  - **Google Keep Widget:** iframe → Local "Hızlı Notlar" widget (localStorage, Keep'in public API'si yok).
  - **googleAuthService.ts:** `prompt=none` (non-interactive) / `prompt=consent` (force re-auth) / `prompt=select_account` (normal interactive). abortOnLoadForNonInteractive: true.

- **Store Edition Altyapısı:**
  - `pnpm build` → `dist/` — Personal edition (gmail.readonly + snippet görünür)
  - `pnpm build:store` → `dist-store/` — Store edition (gmail.metadata, snippet gizli)
  - `scripts/build-store.js`: manifest'i geçici olarak değiştirip build alır, sonra restore eder.
  - `GmailWidget.tsx`: `import.meta.env.VITE_EDITION === 'store'` ile snippet koşullu gizlenir.
  - `googleAuthService.ts`: Store modda `format=metadata` ile header-only fetch.

- **Privacy Policy:** `docs/privacy-policy.html` oluşturuldu (GitHub Pages için). URL: `https://alazndy.github.io/GTab/privacy-policy.html`

### Yapacakları
- Google Cloud Console → Branding URL'lerini alazlab.com/gtab ile güncelle + verification yeniden gönder
- alazlab.com domainini portfolio-site'a bağla (DNS + Vercel/GitHub Pages)
- `/gtab` route'u portfolio-site'a ekle (privacy policy + proje sayfası)
- Store'a `dist-store/` klasörünü yükle

### Notlar
- **Scope özeti:** `gmail.metadata` (sensitive) = gönderen+konu. `gmail.readonly` (restricted) = snippet dahil tam okuma. Personal'da readonly kullanılıyor.
- **Spotify:** Her kullanıcı kendi Spotify Developer App'ini kuruyor (developer.spotify.com → app oluştur → redirect URI ekle → client ID gir). Extended Quota başvurusu yapılırsa hardcode edilebilir.
- **Google Tasks 403:** REAUTH_REQUIRED → setToken(null) → login butonu. API_NOT_ENABLED → GCP'de Tasks API aktif edilmeli.
- `dist/` = personal (gmail.readonly), `dist-store/` = store (gmail.metadata)

## Gemini
### Yaptıkları
- **v5.0 — Command & Focus Progress:**
  - **useAmbientAudio Hook:** HTML5 Audio tabanlı, singleton pattern ve ref-counting ile temizlenen ambient ses motoru eklendi. (Task 3)
- **v4.3.0 Official Release:**
  - `pnpm build` ve `pnpm build:store` ile her iki sürüm inşa edildi.
  - `dist/` ve `dist-store/` klasörleri ziplenerek `releases/` klasörüne eklendi.
  - GitHub üzerinde resmi **v4.3.0 - The Widget Era** release'i oluşturuldu ve dosyalar eklendi.
  - `main`, `personal` ve `store` branch'leri senkronize edildi.
  - `README.md` v4.3.0 özelliklerini ve Personal/Store edition farklarını açıklayacak şekilde güncellendi.
- **v4.2.4 Aesthetic Controls & Version Fix**
- **v4.2.3 Comprehensive Quick Settings**
- **v4.2.2 Control Center Quick Settings**
- **v4.2.1 Workspace Cleanup & Build**
- **v4.2.0 Live Shuffle DnD & Settings Navigation**
### Yapacakları
- **v4.3.0+:** Dosya yapısını parçalamaya devam.
### Notlar
- `hooks/useWidgetDnD.ts` artık `liveLayout` state'i ile anlık sürükleme tepkileri veriyor.

## Antigravity
### Yaptıkları
- Component Decomposition (CategoryFilterWidget, ShortcutGridWidget, WidgetQuickSettings, ShortcutProfileDropdown)
- Freeform Layout + Collision Detection (useFreeLayoutDrag.ts)
- Animated Glow Orbs (Portal tema)
- Tasks Widget Refactor (yer değiştirilebilir widget)
- Google Tasks + Google Keep iframe tabanlı widget'lar (sonradan Claude tarafından yeniden yazıldı)
### Yapacakları
- UI Bütünlüğü Kontrolü (margin/padding uyumsuzlukları)
### Notlar
- `App.tsx` artık neredeyse tamamen state yönetimi ve ana layout sarmalayıcısı.

## Plan
### Tamamlananlar
- [x] v4.0.0 Phase 1: Context API Migration
- [x] v4.1.0 Phase 2: Advanced Widget Mechanics
- [x] v4.2.0 Phase 3: Live Shuffle DnD & Settings Navigation
- [x] v4.2.5 Google Tasks API + Keep (local notes) + OAuth fixes
- [x] v4.3.0 Weather / Pomodoro / Spotify widget'ları
- [x] Store Edition build sistemi (gmail.metadata vs gmail.readonly)
- [x] Privacy Policy sayfası
- [x] README v4.3.0 güncellemesi ve Branch yönetimi (personal/store)
- [x] GitHub Push (main, personal, store)
- [x] v4.3.0 Official GitHub Release (Assets attached)

### Devam Edenler
- [ ] Google OAuth Consent Screen branding + verification başvurusu
- [ ] GitHub Pages aktif etme

### Sıradakiler
- [ ] Chrome Web Store yayını (dist-store/)
- [ ] Spotify Extended Quota başvurusu (opsiyonel)
- [ ] RSS/Haber widget (Tier 2)
- [ ] GitHub Activity widget (Tier 2)

## Karar Günlüğü
| Tarih | Agent | Karar | Neden |
|-------|-------|-------|-------|
| 2026-04-28 | Gemini | v4.2.0 Release | Live Shuffle DnD ve ayar erişim iyileştirmeleri tamamlandı. |
| 2026-04-29 | Claude | gmail.readonly → store'da gmail.metadata | Restricted scope security assessment çok pahalı; metadata sensitive scope, verification ücretsiz. |
| 2026-04-29 | Claude | İki build edition | Personal (dist/) tam özellikli, store (dist-store/) verification-ready. |
| 2026-04-29 | Claude | Google Keep → local notes | Keep'in public API'si yok, iframe X-Frame-Options ile bloklu. |
| 2026-04-29 | Claude | Spotify user-setup | Her kullanıcı kendi app'ini kuruyor; Extended Quota başvurusu gelecekte yapılabilir. |
