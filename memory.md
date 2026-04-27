# GTab Memory

## Son Durum
- Tarih: 2026-04-27
- Aktif agent: Gemini
- Versiyon: **3.0.0** (store ZIP: `gtab_v3.0.0.zip`)

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
- **v3.0.0 "Smart Widget" Mimarisi:** Gmail, Google Takvim ve Borsa widget'ları sisteme entegre edildi.
  - **Google Auth:** Chrome Identity API ile OAuth2 entegrasyonu sağlandı. Fixed: `manifest.json` dosyasına sabit extension ID sağlayan "key" property eklendi.
  - **Gmail Widget:** Okunmamış e-postaları konu ve özetle listeleme özelliği eklendi.
  - **Takvim Widget:** Yaklaşan etkinlikleri zamanlarıyla gösterme özelliği eklendi.
  - **Borsa Widget:** Finnhub API entegrasyonu ile gerçek zamanlı hisse takibi eklendi.
  - **Ayarlar:** `BackgroundSettingsModal` içine Finnhub API Key ve sembol yönetimi eklendi.
  - **Layout:** Yeni widget'lar mevcut kullanıcıların düzenine otomatik enjekte edilecek şekilde ayarlandı.
- **Jules PR & Branch Temizliği:** Jules'un 35 adet performansa dayalı PR'ı incelendi ve değerli olanlar (Clock cache, point updates) v3'e dahil edildi.
- **v3.0.0 Release:** Versiyon 3.0.0'a yükseltildi, `pnpm build` alındı ve `gtab_v3.0.0.zip` hazırlandı.
- **Layout Fix:** `App.tsx` içerisindeki `max-w-7xl` kısıtlaması kaldırılarak tam genişlik (full width) desteği sağlandı.
### Yapacakları
- —
### Notlar
- Google API'ları için `manifest.json` içindeki `client_id` ve `key` test edildi.
- Borsa verileri için Finnhub.io üzerinden ücretsiz API key gereklidir.

## Antigravity
...
## Plan
### Tamamlananlar
- [x] Proje keşfi ve analiz.
- [x] `memory.md` oluşturma.
- [x] **v2.0.0 Store ZIP hazırlığı.**
- [x] **v3.0.0 Smart Widget Mimarisi (Gmail, Calendar, Stocks).**
- [x] **v3.0.0 Store ZIP ve Release hazırlığı.**
- [x] **Google Auth Fix (Extension Key added).**
### Devam Edenler
- [ ] —
### Sıradakiler
- [ ] Kullanıcının taleplerine göre geliştirmeler.

## Karar Günlüğü
| Tarih | Agent | Karar | Neden |
|-------|-------|-------|-------|
| 2026-04-19 | Antigravity | v2.0.0 Release | Kullanıcı talebi üzerine majör versiyon artırımı ve store paketlemesi yapıldı. |
| 2026-04-27 | Gemini | Smart Widget Mimarisi | GTab'ı tam kapsamlı bir üretkenlik paneline dönüştürmek için Gmail, Takvim ve Borsa entegrasyonları yapıldı. |
| 2026-04-27 | Gemini | v3.0.0 Release | Yeni widget mimarisi ile birlikte majör sürüm geçişi yapıldı. |
