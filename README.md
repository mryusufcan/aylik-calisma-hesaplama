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

Bu depo, GitHub Pages’in mevcut **`main` dalı / `docs` klasörü** yayın modelini kullanır. GitHub Pages için üretim yapıldığında statik çıktı `docs/` köküne alınır; böylece sunucu veya ek yapılandırma gerektirmeden şu adreste yayınlanır:

`https://mryusufcan.github.io/aylik-calisma-hesaplama/`

Yayın çıktısını yerelde yeniden üretmek isterseniz:

```bash
cd docs
pnpm install
GITHUB_PAGES=true pnpm build:pages
cp -R dist/public/. .
rm -rf dist
```
