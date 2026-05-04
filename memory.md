# GTab Memory

## Son Durum
- Tarih: 2026-05-04
- Aktif agent: Gemini
- Versiyon: **5.3.0**
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
  - **Google Tasks Widget:** iframe → Tasks REST API've geçiş (Gmail gibi). REAUTH_REQUIRED, API_NOT_ENABLED hata tespiti. forceConsent=true mekanizması.
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
- **v5.3.0 — Global Launchpad Modal Official Release:**
  - `package.json` ve `manifest.json` versiyonları `5.3.0` olarak güncellendi.
  - **Launchpad Modal:** Dock'a tıklandığında ekranın ortasında açılan, glassmorphic bir 'Uygulama Başlatıcı' (Launchpad) hayata geçirildi.
  - **Grid Sistemi:** Modal içinde tüm kısayollar büyük ikonlar ve başlıklarla ızgara (grid) yapısında listeleniyor.
  - **Detaylı İstatistikler:** Modal'ın üst kısmında Pomodoro, Hava Durumu ve Görev sayıları daha detaylı şekilde gösteriliyor.
  - **Yapılandırılabilir Davranış:** `DataTab.tsx` üzerinden dock tıklama davranışı seçilebilir kılındı ('Yana Genişle' veya 'Modal Aç').
  - **Kapatma Mekanizmaları:** Modal dışına tıklama, `Esc` tuşu veya kapat butonu ile modalın kolayca kapatılması sağlandı.
- **v5.2.0 — Global Floating Dock:**
  - Global Status Bar, modern ve yüzen bir "Floating Dock" yapısına dönüştürüldü.
  - **Dinamik Renkler:** Dock'un renkleri GTab ana temasıyla senkronize edildi; artık seçilen temaya göre otomatik renk değiştiriyor.
- **v5.1.0 — Global Nav & Quote Refactor:**
  - Shadow DOM tabanlı Global Status Bar hayata geçirildi.
  - `QuoteDisplay` ekranın üst kısmına (`top-20`) taşındı.
- **v5.0.0 — Command & Focus:**
  - Command Palette (Alt+K) ve Gemini AI entegrasyonu tamamlandı.
  - ZenQuotes and Ambient Sounds sistemleri kuruldu.
  - Görev yönetimi global context'e taşındı.
- **v5.0 — Final Polish & UX Improvements:**
  - `storageService.ts`: Tam yedekleme (full backup) versiyonu `5.0.0` olarak güncellendi.
  - `QuoteDisplay.tsx`: "Pop-in" etkisini önlemek için state `FALLBACK_QUOTE` ile başlatıldı.
  - `SearchBar.tsx`: Arama çubuğu yer tutucusu "Search or Ctrl+K for Commands..." olarak güncellendi.
  - Görevlerin `localStorage` persistence mekanizması `GTabContext` içine entegre edildi.

## Antigravity
### Yaptıkları
- Component Decomposition (CategoryFilterWidget, ShortcutGridWidget, WidgetQuickSettings, ShortcutProfileDropdown)
- Freeform Layout + Collision Detection (useFreeLayoutDrag.ts)
- Animated Glow Orbs (Portal tema)
- Tasks Widget Refactor (yer değiştirilebilir widget)
- Google Tasks + Google Keep iframe tabanlı widget'lar (sonradan Claude tarafından yeniden yazıldı)
### Yapacakları
- UI Bütünlüğü Kontrolü (margin/padding uyumsuzlukları)
- **Infrastructure Hardening & Optimization (v5.4.0 Hazırlık):**
  - Tam codebase taraması yapıldı, monolith bileşenler belirlendi.
  - `manifest.json` versiyonu v5.3.0 ile senkronize edildi.
  - Refactoring için stratejik plan (`hardening_plan.md`) oluşturuldu.

### Notlar
- `App.tsx` artık neredeyse tamamen state yönetimi ve ana layout sarmalayıcısı.
- Kod tabanı v5.3.0 ile stabil, bir sonraki aşama altyapı güçlendirme.

## Plan
### Tamamlananlar
- [x] v4.3.0 Weather / Pomodoro / Spotify widget'ları
- [x] v5.0.0 Command Palette & AI Integration
- [x] v5.1.0 Global Status Bar & Quote Repositioning
- [x] v5.2.0 Global Floating Dock Transformation
- [x] v5.3.0 Global Launchpad Modal Implementation
- [x] package.json & manifest.json version sync (v5.3.0)
- [x] Full codebase scan & Hardening Plan (Antigravity)
- [x] Official Build (pnpm build & build:store)

### Devam Edenler
- [ ] Google OAuth Consent Screen branding + verification başvurusu
- [ ] GitHub Pages aktif etme

### Sıradakiler
- [ ] Chrome Web Store yayını (dist-store/)
- [ ] RSS/Haber widget (Tier 2)
- [ ] GitHub Activity widget (Tier 2)

## Karar Günlüğü
| Tarih | Agent | Karar | Neden |
|-------|-------|-------|-------|
| 2026-05-03 | Gemini | v5.3.0 Release | Launchpad Modal özelliği eklendi. |
| 2026-05-03 | Gemini | v5.2.0 Release | Floating Dock ve konumlandırma özellikleri tamamlandı. |
| 2026-04-29 | Claude | gmail.readonly → store'da gmail.metadata | Restricted scope security assessment çok pahalı; metadata sensitive scope, verification ücretsiz. |
| 2026-04-29 | Claude | İki build edition | Personal (dist/) tam özellikli, store (dist-store/) verification-ready. |
