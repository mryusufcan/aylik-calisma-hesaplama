# Çalışma Saati Hesaplayıcı

Türkiye’de vardiyalı çalışanlar için aylık çalışma saatini hesaplayan, tarayıcıda çalışan hafif bir araçtır.

> Hesaplama formülü: **toplam gün − Pazar − resmî tatil − ek izin = çalışma günü**. Sonuç, çalışma günü sayısının günlük çalışma saatiyle çarpılmasıyla elde edilir.

## Özellikler

| Alan | Açıklama |
|---|---|
| Aylık hesaplama | Seçilen ayın toplam gününden Pazar, resmî tatil ve ek izinleri çıkarır. |
| Günlük süre | Varsayılan **5,83 saat** değeri kullanıcı tarafından değiştirilebilir. |
| Takvim görünümü | Çalışma, Pazar, resmî tatil ve ek izin günlerini ayrı renklerle gösterir. |
| Yerel saklama | Ayarlar ve ek izinler yalnızca kullanıcının tarayıcısında saklanır. |
| CSV dışa aktarma | Aylık özeti CSV dosyası olarak indirir. |

## Yerel geliştirme

```bash
pnpm install
pnpm dev
```

## GitHub Pages dağıtımı

`main` dalına yapılan her gönderim, `.github/workflows/deploy-pages.yml` iş akışını başlatır. GitHub deposunda **Settings → Pages → Build and deployment → Source** seçeneğini **GitHub Actions** olarak ayarlayın. İş akışı tamamlandıktan sonra uygulama şu adreste yayınlanır:

`https://mryusufcan.github.io/aylik-calisma-hesaplama/`

GitHub Pages için yerel üretimi doğrulamak isterseniz:

```bash
pnpm build:pages
```
