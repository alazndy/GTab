# GTab Memory

## Son Durum
- Tarih: 2026-04-27
- Aktif agent: Gemini
- Versiyon: **2.0.1** (store ZIP: `gtab_v2.0.1.zip`)

## Claude
### Yaptıkları
- Donate butonu kaldırıldı, BMC URL güncellendi.
- `CardConfig` (bgOpacity, shape, size, alignment, font, **iconSize**) sistemi eklendi.
- `BackgroundSettingsModal.tsx` sidebar+içerik mimarisine yeniden yazıldı.
- `ShortcutCard.tsx` dinamik kart/ikon boyutu, şekli, opaklığı.
- Profil/URL import-export (JSON) eklendi.
- Grup mekaniği yeniden yazıldı (3-adım modal, FolderViewModal, profil-aware URL çözümlemesi).
- Tüm modaller glassmorphism temaya uyarlandı.
- **Sağ tık → "GTab'a ekle"** context menu (background.js service worker).
- **Eklenti popup'u** (popup.html): mevcut sekme ekleme, görünürlük toggle, profil seçerek ekleme, hızlı nav.
- **Tema rengi profil menüsüne** yansıtıldı (`--menu-bg`, `--menu-border` CSS değişkenleri).
- **Aperture (Portal) teması** eklendi.
- v1.1.0 build + store ZIP oluşturuldu.
### Yapacakları
- —
### Notlar
- CardConfig ayarları anlık uygulanır, modal kapanmaya gerek yok.
- Popup hidden IDs: `gtab_popup_hidden` localStorage key.

## Gemini
### Yaptıkları
- `README.md` v2.0.0 majör sürüm özelliklerine göre güncellendi.
- `STORE_DESCRIPTION.md` v2.0.0 yenilikleri ve detaylı özellikler ile güncellendi.
- Versiyon 2.0.0 için dokümantasyon tamamlandı.
- **v2.0.0 Release** (`gh release create`) gerçekleştirildi ve `gtab_v2.0.0.zip` yüklendi.
- **Jules PR & Branch Temizliği:** Jules'un 35 adet performansa dayalı PR'ı incelendi.
  - PR #35 (Clock & Workflow optimization) merge edildi.
  - PR #32 (State point updates) manuel olarak `App.tsx` ve `TasksWidget.tsx` dosyalarına uygulandı.
  - Redundant olan PR #34 ve #33 kapatıldı.
  - GitHub Workflows dosyalarına API key kontrolü eklendi.
  - `.jules/bolt.md` güncellendi.
- **v2.0.1 Release:** Versiyon 2.0.1'e yükseltildi, `pnpm build` alındı ve `gtab_v2.0.1.zip` oluşturulup GitHub Release olarak yayınlandı.
- **Task 2 - Manifest Güncellemesi:** GTab v3.0 Widget mimarisi için `public/manifest.json` dosyasına `identity` izni, host izinleri ve OAuth2 yapılandırması eklendi.
- **Task 3 - Auth & API Servisleri:** `services/googleAuthService.ts` ve `services/finnhubService.ts` oluşturuldu. Google Auth servisi için TypeScript tip hatası (`GetAuthTokenResult`) giderildi.
### Yapacakları
- —
### Notlar
- OAuth2 client_id diğer GTab eklentisinden temin edildi.
- `chrome.identity.getAuthToken` callback'i bazı @types/chrome sürümlerinde string yerine obje dönebildiği için `googleAuthService.ts` içerisinde tip kontrolü eklendi.

## Antigravity
### Yaptıkları
- Proje dosyaları incelendi.
- `package.json`, `App.tsx` ve `README.md` dosyaları okundu.
- `package.json` ve `manifest.json` versiyonları sırasıyla 1.1.2 -> 1.1.9'a güncellendi.
- **Portal teması parlamaları artırıldı (v1.1.8).**
- **Dinamik ızgara kontrolü:** Yatay/Dikey aralık ve 2-12 arası kolon sayısı ayarları eklendi.
- **Profil Menüsü:** Kart genişliğinden bağımsız okunabilir sabit genişlik ve özelleştirilebilir opaklık/çerçeve.
- **"Yeni Ekle" Kartı:** Daha transparan ve minimal bir tasarıma geçirildi.
- **Ayarlar Ekranı (v1.1.9):** Tamamen yeniden tasarlandı. Sidebar yenilendi, ayarlar kategorize edildi (Düzen, Görünüm, Tipografi), Glassmorphism detayları artırıldı.
- **Build & Release (v2.0.0):** Versiyon 2.0.0'a yükseltildi, `pnpm build` alındı ve Store için `gtab_v2.0.0.zip` oluşturuldu.
### Yapacakları
- —
### Notlar
- Ayarlar ekranı artık daha fazla dikey içerik barındırdığı için kategori bazlı scroll ve kart yapısı kullanıyor.
- `gh` CLI sürümü check edildi ve release asset yüklemesi için kullanıldı.

## Plan
### Tamamlananlar
- [x] Proje keşfi ve analiz.
- [x] `memory.md` oluşturma.
- [x] **v1.1.3 - v1.1.8 Release yayınlama (Portal iyileştirmeleri, Grid Kontrolü).**
- [x] **v1.1.9 Release yayınlama (Ayarlar Ekranı Redesign).**
- [x] **v2.0.0 Store ZIP hazırlığı.**
- [x] **v2.0.1 Release (Performance Optimizations).**
- [x] **GitHub & Dist güncellemeleri.**
- [x] **Task 2: Chrome Extension Manifest Update.**
- [x] **Task 3: Create Authentication & API Services.**
- [x] **Task 4: Quality Fixes.** Hardcoded widths (w-64) removed from Gmail, Calendar, and Stocks widgets to support dynamic grid layout. Icon consistency verified.
- [x] Task 5: Integrate Widgets into App Layout. Verified App.tsx integration, imports, and reset layout functionality. Updated `getLayoutConfig` in `storageService.ts` to ensure automatic migration of new widgets (Gmail, Calendar, Stocks) for existing users.
### Devam Edenler
- [ ] —
### Sıradakiler
- [ ] GTab v3.0 Widget Mimarisi Uygulama Planı'ndaki diğer görevler.
- [ ] Test verification for Gmail/Calendar/Stocks auth flows.

## Karar Günlüğü
| Tarih | Agent | Karar | Neden |
|-------|-------|-------|-------|
| 2026-04-14 | Antigravity | `memory.md` oluşturuldu | MASTER.md kuralları gereği zorunlu. |
| 2026-04-15 | Antigravity | Grid Gap & Cols Kontrolü | URL kartları üzerinde daha fazla esneklik sağlamak için (v1.1.8). |
| 2026-04-15 | Antigravity | Settings Modal Redesign (v1.1.9) | Karmaşıklaşan ayar listesini kullanıcı talebi üzerine düzenlemek ve daha premium bir his vermek için. |
| 2026-04-15 | Antigravity | `tar` ile ZIPleme | `Compress-Archive` powershell komutundaki kilitlenme problemlerini aşmak için daha stabil olan `tar` kullanıldı. |
| 2026-04-19 | Antigravity | v2.0.0 Release | Kullanıcı talebi üzerine majör versiyon artırımı ve store paketlemesi yapıldı. |
| 2026-04-27 | Gemini | v2.0.1 Release | Jules'un performans optimizasyonlarını içeren patch sürümü. |
