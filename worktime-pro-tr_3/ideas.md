# WorkTime Pro TR — Tasarım Yönü

## Üç Olası Yaklaşım

| Tema Adı | Çok Kısa Tanım | Olasılık |
| --- | --- | --- |
| **Anadolu Ajandası** | Mat kağıt dokuları, takvim kenar notları ve sıcak toprak tonlarıyla kişisel bir çalışma defteri hissi yaratır. Aracın günlük kullanımını sakin ve insani bir ritüele dönüştürür. | 0.08 |
| **Klinik Zaman Panosu** | Sağlık ve vardiyalı çalışma bağlamına uygun, ölçülü indigo tonları ile açık yönlendirmeyi birleştiren çağdaş bir operasyon panelidir. Bilgiyi düzenli, güvenilir ve hızla taranabilir sunar. | 0.03 |
| **Gece Vardiyası Sinyali** | Koyu lacivert zemin üzerinde sınırlı elektrik mavisi ve amber sinyalleri kullanan daha yüksek kontrastlı bir gece modu odağı kurar. Yoğun nöbet dönemlerinde güçlü görsel ayrım sağlar. | 0.09 |

## Seçilen Yaklaşım: Klinik Zaman Panosu

### Tasarım Hareketi

Bu ürün, **İsviçre bilgi tasarımı** ile çağdaş klinik operasyon ekranlarının ölçülü netliğini birleştirir. Amaç, çalışma planını dekoratif bir yüzey yerine karar vermeyi kolaylaştıran bir zaman enstrümanı gibi hissettirmektir.

### Temel İlkeler

1. **Önce durum, sonra ayrıntı:** Kullanıcının hedef saatine göre durumu ilk bakışta anlaşılır olmalı; takvim ve dağılım bunun altında açıklayıcı rol üstlenmelidir.
2. **Sakin güven:** Yumuşak kırık beyaz zemin, koyu arduvaz metin ve yalnızca anlam taşıyan indigo, turkuaz, amber ve mercan vurgu renkleri kullanılmalıdır.
3. **Zamansal ritim:** Takvim, ay seçimi ve özet kartları aynı görünmez zaman eksenine oturmalı; boşluklar da bu ritmi desteklemelidir.
4. **Doğrudan etkileşim:** İzin günleri takvimden tek hamlede yönetilmeli, hesaplamalar beklemeden yenilenmeli ve her kritik değişiklik anlaşılır geri bildirim vermelidir.

### Renk Felsefesi

Arayüzün ana zemini, beyazdan daha yumuşak bir **klinik sis** tonudur; uzun vardiyalarda göz yorgunluğunu azaltmayı hedefler. Marka rengi olan **Nabız İndigosu** (`#3F5DE8`), yalnızca yönlendirme, aktif durum ve ana eylemler için kullanılır. Turkuaz olumlu saat dengesini, amber yaklaşan hedefi, mercan ise fazla mesai ya da dikkat gerektiren farkı temsil eder. Renkler anlamsal görev dışına taşmamalıdır.

### Yerleşim Paradigması

Masaüstünde tasarım, merkezdeki simetrik kart ızgarası yerine bir **çalışma tezgâhı** olarak kurulacaktır: solda ayar ve takvim eylemleri için dar bir kontrol şeridi, sağda ise daha geniş durum özeti ile takvim yüzeyi bulunacaktır. Ay özeti üstte yatay bir zaman şeridi gibi davranır; alt bölümde takvim ve saat dağılımı farklı ağırlıklarla yer alır. Mobilde kontrol şeridi içerikten önce açılır ve kritik durum kartı sabit bir öncelik kazanır.

### İmza Öğeleri

Uygulama boyunca üç motif korunacaktır: seçili dönemi işaretleyen ince **zaman rayı**, gün türlerini ayıran dikey **takvim omurgaları** ve hedefe yaklaşmayı gösteren yarım halka biçimli **denge göstergesi**. Bu öğeler yalnızca görsel süs değil, bilgi hiyerarşisinin parçasıdır.

### Etkileşim Felsefesi

Etkileşimler, kullanıcının çalışma planı üzerinde denetim hissini artırmalıdır. Girdi değişiklikleri anında hesaplama üretir; ek izin işleminde kaydedildi veya geri alındı bildirimi sunulur; CSV dışa aktarma tek adımda tamamlanır. Klavyeyle erişilebilen belirgin odak halkaları ve açık düğme durumları, hızlı işlemler için zorunludur.

### Animasyon

Animasyon, gürültü yerine geri bildirim içindir. Kartlar sayfa açılışında 40–60 ms aralıklarla yalnızca opaklık ve küçük düşey konum değişimiyle görünür. Sayısal değerler kısa geçişle güncellenir; gün hücreleri üzerine gelindiğinde hafif yüzey yükselmesi, seçildiğinde anlık ölçek tepkisi verir. Tüm hareketler 180–260 ms aralığında, `cubic-bezier(0.23, 1, 0.32, 1)` eğrisiyle çalışır ve azaltılmış hareket tercihi olduğunda kapatılır.

### Tipografi Sistemi

Başlıklarda **Bricolage Grotesque**, açıklama ve form metinlerinde **DM Sans** kullanılacaktır. Ürün adı daha geniş ve ağır bir hiyerarşiyle, durum değeri ise sekmeli rakamlarla sunulacaktır. Yardımcı etiketler büyük harf kullanılmadan, orta kontrastla ve kısa tutulacaktır.

### Marka Özü

**Konumlandırma:** WorkTime Pro TR, vardiyalı çalışanların ay içindeki zaman dengesini net, güvenilir ve zahmetsiz biçimde görmesini sağlayan kişisel çalışma planı aracıdır.

**Kişilik:** Dengeli, güvenilir, sakin.

### Marka Sesi

Başlıklar doğrudan sonucu belirtir; çağrılar kısa ve eylem odaklıdır; mikro metinler kaygı yaratmadan süreci açıklar. Genel ifadelerden kaçınılır.

> “Ağustos planın dengede.”

> “İzin gününü takvimden işaretle; toplam süre hemen yenilensin.”

### Wordmark ve Logo

Logo, üst üste gelen iki köşeli takvim hücresinin arasında yer alan kısa zaman çizgisinden oluşan metinsiz bir sembol olacaktır. İşaret, ay planı ile saat dengesinin tek bakışta okunması fikrini taşır ve header ile favicon içinde görünür boyutta kullanılmalıdır.

### İmza Marka Rengi

**Nabız İndigosu — `#3F5DE8`**

## Style Decisions

- Başlıklar ve ana değerler Bricolage Grotesque ile daha geniş, karakterli display ölçekte; form ve açıklama metinleri DM Sans ile sade kalacaktır. Yardımcı etiketler büyük harfli pano dili yerine sakin, doğal cümle yapısıyla yazılacaktır.
- Denge gösterimi, ürün boyunca hedefe yaklaşımı gösteren yarım halka biçimli klinik ölçüm enstrümanıyla ifade edilir. Indigo yalnızca aktif/yönlendirici durum için; turkuaz, amber ve mercan yalnızca anlamsal denge farklarında kullanılır.
- Zaman rayı ve takvim omurgaları, hero, aylık metrik şeridi ve takvim yüzeyini tek bir çalışma tezgâhının ilişkili parçaları olarak bağlar.
- Dekoratif görsel, kağıt veya masaüstü kolajı değil; düşük kontrastta kalmış operasyonel ızgara ve ölçüm yüzeyini destekleyen bir arka plan dokusudur.
