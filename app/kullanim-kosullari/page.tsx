'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function KullanimKosullariPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl">🧼</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TemizPro
                </span>
              </Link>
            </div>
            
            <div className="flex gap-4 items-center">
              <Link href="/" className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Kullanım Koşulları</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Son Güncellenme: {new Date().toLocaleDateString('tr-TR')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Genel Koşullar</h2>
            <p className="leading-relaxed">
              Bu web sitesini kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. 
              Koşulları kabul etmiyorsanız, lütfen siteyi kullanmayınız.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Hizmet Kapsamı</h2>
            <p className="leading-relaxed mb-3">TemizPro aşağıdaki hizmetleri sunmaktadır:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Halı yıkama ve temizleme hizmetleri</li>
              <li>Koltuk yıkama ve bakım hizmetleri</li>
              <li>Yorgan yıkama hizmetleri</li>
              <li>Ücretsiz alım ve teslim hizmeti</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Sipariş ve Rezervasyon</h2>
            <p className="leading-relaxed mb-3">Sipariş verirken:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>18 yaşından büyük olmalısınız</li>
              <li>Hizmet bedelini ödemekle yükümlüsünüz</li>
              <li>Alım ve teslim için uygun zaman dilimlerini belirlemelisiniz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Fiyatlandırma</h2>
            <p className="leading-relaxed">
              Tüm fiyatlar Türk Lirası cinsinden ve KDV dahildir. Fiyatlar önceden haber verilmeksizin değiştirilebilir. 
              Sipariş anındaki fiyat geçerli olacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Ödeme</h2>
            <p className="leading-relaxed mb-3">Ödeme yöntemleri:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kredi/Banka kartı ile online ödeme</li>
              <li>Kapıda nakit ödeme</li>
              <li>Kapıda kredi kartı ile ödeme</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Tüm online ödemeler SSL sertifikası ile güvence altındadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Teslimat</h2>
            <p className="leading-relaxed">
              Alım ve teslim hizmetimiz İstanbul genelinde ücretsizdir. Teslim süreleri hizmet türüne göre 
              değişiklik gösterebilir. Tahmini teslimat süreleri sipariş aşamasında bildirilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sorumluluk</h2>
            <p className="leading-relaxed">
              Hizmetlerimizi en iyi şekilde sunmak için çalışıyoruz. Ancak doğal aşınma, üründeki mevcut hasarlar 
              veya yanlış bilgilendirme nedeniyle oluşabilecek zararlardan sorumlu değiliz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Kullanıcı Yükümlülükleri</h2>
            <p className="leading-relaxed mb-3">Kullanıcılar:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Yasalara uygun hareket etmelidir</li>
              <li>Doğru bilgi vermekle yükümlüdür</li>
              <li>Hizmeti engelleyici davranışlarda bulunmamalıdır</li>
              <li>Ödeme yükümlülüklerini yerine getirmelidir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Fikri Mülkiyet</h2>
            <p className="leading-relaxed">
              Bu web sitesindeki tüm içerik, tasarım ve materyaller TemizPro'nun mülkiyetindedir ve 
              fikri mülkiyet yasaları ile korunmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Değişiklikler</h2>
            <p className="leading-relaxed">
              Bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutarız. 
              Güncel koşulları düzenli olarak kontrol etmenizi öneririz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Uyuşmazlık Çözümü</h2>
            <p className="leading-relaxed">
              Bu sözleşmeden kaynaklanan her türlü uyuşmazlıkta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. İletişim</h2>
            <p className="leading-relaxed">
              Kullanım koşulları hakkında sorularınız için:
              <br />
              E-posta: <a href="mailto:info@haliyikama.com" className="text-purple-600 hover:underline">info@haliyikama.com</a>
              <br />
              Telefon: 0850 123 45 67
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
