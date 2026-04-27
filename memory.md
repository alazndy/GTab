# GTab Memory

## Son Durum
- Tarih: 2026-04-19
- Aktif agent: Antigravity
- Versiyon: **2.0.0** (store ZIP: `gtab_v2.0.0.zip`)

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
- **Jules PR & Branch Temizliği:** Jules'un 31 adet performansa dayalı PR'ı incelendi. Değerli olanlar (özellikle Clock rendering cache) ana koda dahil edildi, diğerlerinin zaten uygulanmış olduğu doğrulandı. Tüm PR'lar kapatıldı ve dallar temizlendi.
### Yapacakları
- —
### Notlar
- —

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
- [x] **GitHub & Dist güncellemeleri.**
### Devam Edenler
- [ ] —
### Sıradakiler
- [ ] Kullanıcının taleplerine göre geliştirmeler.

## Karar Günlüğü
| Tarih | Agent | Karar | Neden |
|-------|-------|-------|-------|
| 2026-04-14 | Antigravity | `memory.md` oluşturuldu | MASTER.md kuralları gereği zorunlu. |
| 2026-04-15 | Antigravity | Grid Gap & Cols Kontrolü | URL kartları üzerinde daha fazla esneklik sağlamak için (v1.1.8). |
| 2026-04-15 | Antigravity | Settings Modal Redesign (v1.1.9) | Karmaşıklaşan ayar listesini kullanıcı talebi üzerine düzenlemek ve daha premium bir his vermek için. |
| 2026-04-15 | Antigravity | `tar` ile ZIPleme | `Compress-Archive` powershell komutundaki kilitlenme problemlerini aşmak için daha stabil olan `tar` kullanıldı. |
| 2026-04-19 | Antigravity | v2.0.0 Release | Kullanıcı talebi üzerine majör versiyon artırımı ve store paketlemesi yapıldı. |
