# SharpXch SofaScore Linker

SharpXch platformunda maç istatistiklerine hızlı erişim sağlayan bir Chrome eklentisi. Her maçın yanına SofaScore linki ekleyerek detaylı istatistiklere tek tıkla ulaşmanızı sağlar.

## Özellikler

### 🔗 SofaScore Entegrasyonu
- Her maçın yanına otomatik SofaScore linki ekler
- Maç detaylarına tek tıkla erişim
- Akıllı oyuncu ismi algılama sistemi
- Çift link eklenmesini önleyen gelişmiş kontrol mekanizması

### 💰 Bahis Miktarı Koruma
- Oranlar değiştiğinde bahis miktarlarınız kaybolmaz
- Otomatik değer geri yükleme
- Kullanıcı kontrolünde silme desteği
- Popup üzerinden açma/kapama seçeneği

### ⚙️ Ayarlar Yönetimi
- Minimalist toggle butonu ile ayarları gizleme/gösterme
- "Confirm bets before placement" ayarlarını yönetme
- LocalStorage ile ayar kalıcılığı
- Kullanıcı dostu arayüz

## Kurulum

### Chrome Web Store'dan (Önerilen)
*Yakında Chrome Web Store'da yayınlanacak*

### Manuel Kurulum (Geliştirici Modu)

1. Bu depoyu klonlayın:
   ```bash
   git clone https://github.com/kullaniciadi/Sofasharpxch.git
   ```

2. Chrome tarayıcınızı açın ve adres çubuğuna yazın:
   ```
   chrome://extensions/
   ```

3. Sağ üst köşeden **Geliştirici modu**'nu aktif edin

4. **Paketlenmemiş öğe yükle** butonuna tıklayın

5. Klonladığınız klasörü seçin

6. Eklenti otomatik olarak yüklenecektir

## Kullanım

### SofaScore Linklerini Görüntüleme

1. Herhangi bir maç sayfasını açın
2. Her maç sayfasının içinde SofaScore logosu otomatik olarak görünecektir
3. Logoya tıklayarak SofaScore'da maç detaylarını görün

### Bahis Miktarı Koruma

1. Eklenti simgesine tıklayın
2. **Bahis Miktarlarını Koru** seçeneğini açın/kapatın
3. Aktifken, bahis kutusuna girdiğiniz miktarlar korunacaktır

### Ayarları Gizleme/Gösterme

1. SharpXch ayarlar bölümünde sağ üst köşedeki **+** butonunu görün
2. **+** butonu: Ayarları göster
3. **−** butonu: Ayarları gizle
4. Tercihleriniz otomatik olarak kaydedilir

## Teknik Detaylar

### Teknolojiler

- **Manifest Version:** 3 (Chrome'un en güncel eklenti standardı)
- **JavaScript:** Vanilla JS (framework kullanılmamıştır)
- **Storage:** Chrome Storage API
- **CSS:** Modern CSS3

### Dosya Yapısı

```
Sofasharpxch/
├── manifest.json          # Eklenti yapılandırması
├── content.js            # Ana içerik script'i
├── popup.html            # Popup arayüzü
├── popup.js              # Popup script'i
├── popup.css             # Popup stilleri
├── styles.css            # İçerik sayfası stilleri
├── logo_final.png        # SofaScore logosu
├── icon16.png            # 16x16 ikon
├── icon48.png            # 48x48 ikon
├── icon128.png           # 128x128 ikon
└── README.md             # Bu dosya
```

### Önemli Fonksiyonlar

#### `injectSofaScoreIcons()`
Sayfadaki tüm maçları tarar ve SofaScore linklerini ekler. Çift ekleme önleme mekanizması içerir.

```javascript
// Her 1 saniyede bir çalışır
setInterval(injectSofaScoreIcons, 1000);
```

#### `preserveBetInputs()`
Bahis kutularındaki değerleri izler ve korur.

```javascript
// Her 500ms'de bir çalışır
setInterval(preserveBetInputs, 500);
```

#### `injectConfirmBetsToggle()`
Ayarlar bölümüne toggle butonu ekler.

```javascript
// Her 1 saniyede bir çalışır
setInterval(injectConfirmBetsToggle, 1000);
```

### Performans Optimizasyonları

- **Global Set Kullanımı:** İşlenmiş maçları takip eder, gereksiz işlemleri önler
- **MutationObserver:** Sadece gerekli değişiklikleri izler
- **Akıllı İşaretleme:** `data-processed` attribute ile işlenmiş elementleri işaretler
- **Temizleme Mekanizması:** URL değişikliklerinde cache temizlenir

## İzinler

Eklenti aşağıdaki izinleri kullanır:

- **storage:** Kullanıcı tercihlerini kaydetmek için
- **sharpxch.com:** Sadece bu site üzerinde çalışır

## Gizlilik

- Hiçbir kullanıcı verisi toplanmaz
- Tüm ayarlar cihazınızda lokal olarak saklanır
- Üçüncü parti sunuculara veri gönderilmez
- SofaScore linkleri Google "I'm Feeling Lucky" üzerinden açılır

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen aşağıdaki adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/harika-ozellik`)
5. Pull Request açın

### Geliştirme Ortamı Kurulumu

```bash
# Depoyu klonlayın
git clone https://github.com/kullaniciadi/Sofasharpxch.git

# Klasöre girin
cd Sofasharpxch

# Chrome'da geliştirici modunda yükleyin
# chrome://extensions/ -> Geliştirici modu -> Paketlenmemiş öğe yükle
```

### Kod Standartları

- ES6+ JavaScript kullanın
- Anlamlı değişken ve fonksiyon isimleri
- Kod yorumları Türkçe veya İngilizce
- Tutarlı girinti (4 boşluk)

## Sorun Giderme

### SofaScore Linkleri Görünmüyor

- Sayfayı yenileyin (F5)
- Eklentinin aktif olduğundan emin olun
- Console'da hata mesajlarını kontrol edin (F12)

### Bahis Miktarları Korunmuyor

- Popup'tan özelliğin aktif olduğunu kontrol edin
- Tarayıcıyı yeniden başlatın
- Eklentiyi kaldırıp yeniden yükleyin

### Toggle Butonu Çalışmıyor

- LocalStorage temizlenmiş olabilir
- Sayfayı yenileyin
- Ayarları sıfırlayın

## Sürüm Geçmişi

### v2.2 (Mevcut)
- ✨ SofaScore linkleri eklendi
- 💾 Bahis miktarı koruma özelliği
- ⚙️ Ayarlar toggle butonu
- 🐛 Çift link ekleme sorunu çözüldü
- 🚀 Performans iyileştirmeleri

### v1.0
- 🎉 İlk sürüm

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

- **Geliştirici:** [Adınız]
- **GitHub:** [@kullaniciadi](https://github.com/kullaniciadi)
- **E-posta:** your.email@example.com

## Teşekkürler

- [SofaScore](https://www.sofascore.com/) - Harika istatistik platformu için
- Chrome Extensions Team - Detaylı dokümantasyon için
- Tüm katkıda bulunanlara ❤️

---

⭐ **Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
