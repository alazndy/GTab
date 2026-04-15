# GTab Memory

## Son Durum
- Tarih: 2026-04-14
- Aktif agent: Claude
- Versiyon: **1.1.2** (store ZIP: `gtab_v1.1.2.zip`)

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
- —
### Yapacakları
- —
### Notlar
- —

## Antigravity
### Yaptıkları
- Proje dosyaları incelendi.
- `package.json`, `App.tsx` ve `README.md` dosyaları okundu.
- v1.0.3 sürümünün store'da olduğu bilgisi teyit edildi.
- `package.json` ve `manifest.json` versiyonları 1.1.2'ye güncellendi.
- `pnpm build` çalıştırılarak `dist` klasörü oluşturuldu.
- `gtab_v1.1.2.zip` dosyası hazırlandı.
- `types.ts` içerisine `WidgetConfig` için `width` ve `glassEffect` alanları eklendi.
- `storageService.ts` üzerinden layout verisine default değerler (`width: 12`, `glassEffect: true`) tanımlandı.
- `App.tsx` genel layout yapısı `flex flex-col` yerine 12 kolonlu CSS Grid sistemine geçirildi (`grid-cols-12`).
- `App.tsx` Edit Mode içerisine her bir main widget için boyutlandırma (+/- butonları) ve cam/outline (Sparkles Icon) kapama/açma denetimleri eklendi.
### Yapacakları
- —
### Notlar
- Proje modern bir React 19 + Vite projesi.
- Glassmorphism ve performans odaklı bir mimarisi var.

## Plan
### Tamamlananlar
- [x] Proje keşfi ve analiz.
- [x] `memory.md` oluşturma.
- [x] Donate butonu kaldırma, BMC URL güncelleme.
- [x] CardConfig sistemi (opaklık, şekil, boyut, hizalama, font).
- [x] Profil/URL import-export (JSON).
### Devam Edenler
- [ ] —
### Sıradakiler
- [ ] Kullanıcının taleplerine göre geliştirmeler.

## Karar Günlüğü
| Tarih | Agent | Karar | Neden |
|-------|-------|-------|-------|
| 2026-04-14 | Antigravity | `memory.md` oluşturuldu | MASTER.md kuralları gereği zorunlu. |
| 2026-04-14 | Claude | Donate butonu kaldırıldı | Kullanıcı talebi. |
| 2026-04-14 | Claude | CardConfig sistemi eklendi | Görünüm ayarları genişletildi. |
| 2026-04-14 | Claude | Import/Export eklendi | Profil ve URL taşınabilirliği. |
| 2026-04-14 | Antigravity | v1.1.2 Versiyon Güncelleme | release hazırlandı. |
| 2026-04-14 | Antigravity | ZIP Oluşturuldu | gtab_v1.1.2.zip hazırlandı. |
| 2026-04-14 | Antigravity | Widget boyut ve görünüm ayarı | Skeleton-First ile planlandı. Kullanıcının alan outline'ı kapatma ve boyut ayarlama isteğine karşılık Grid sisteme geçildi. |
