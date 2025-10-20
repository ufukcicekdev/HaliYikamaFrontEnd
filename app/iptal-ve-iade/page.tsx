'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function IptalVeIadePage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">İptal ve İade Politikası</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Son Güncellenme: {new Date().toLocaleDateString('tr-TR')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Genel Bilgiler</h2>
            <p className="leading-relaxed">
              Müşteri memnuniyeti önceliğimizdir. Bu politika, sipariş iptali ve iade işlemleriniz hakkında 
              bilmeniz gereken tüm detayları içermektedir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. İptal Koşulları</h2>
            <div className="space-y-4">
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Hizmet Başlamadan Önce İptal</h3>
                <p className="text-sm">
                  Hizmet başlangıç saatinden en az 2 saat önce iptal ederseniz, tam iade alabilirsiniz. 
                  İptal için müşteri hizmetlerimizi arayabilir veya hesabınızdan işlem yapabilirsiniz.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Son Dakika İptali (2 Saat İçinde)</h3>
                <p className="text-sm">
                  Hizmet başlangıcına 2 saatten az bir süre kala yapılan iptallerde %20 iptal ücreti uygulanır.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-600 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Hizmet Başladıktan Sonra</h3>
                <p className="text-sm">
                  Ürünleriniz alındıktan sonra yapılan iptallerde tam ücret tahsil edilir.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. İptal Nasıl Yapılır?</h2>
            <p className="leading-relaxed mb-3">İptal işlemi için aşağıdaki yöntemlerden birini kullanabilirsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Web sitesi üzerinden hesabınıza giriş yaparak</li>
              <li>Müşteri hizmetleri: 0850 123 45 67</li>
              <li>WhatsApp: 0530 123 45 67</li>
              <li>E-posta: info@haliyikama.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. İade Koşulları</h2>
            <p className="leading-relaxed mb-3">Aşağıdaki durumlarda iade talep edebilirsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Hizmetten memnun kalmadıysanız (48 saat içinde)</li>
              <li>Ürününüzde hasar oluştuysa</li>
              <li>Yanlış ürün teslim edildiyse</li>
              <li>Temizlik standartlarımızı karşılamadıysak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. İade Süreci</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">İade Talebi</h4>
                  <p className="text-sm">Müşteri hizmetlerimizle iletişime geçin ve durumu açıklayın.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">İnceleme</h4>
                  <p className="text-sm">Ekibimiz talebinizi en kısa sürede inceler (1-2 iş günü).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Çözüm</h4>
                  <p className="text-sm">Duruma göre yeniden temizleme veya iade işlemi yapılır.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">İade Ödemesi</h4>
                  <p className="text-sm">Onaylanan iadeler 5-7 iş günü içinde hesabınıza yansır.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Fiyat Değişiklikleri</h2>
            <p className="leading-relaxed">
              Sipariş verdikten sonra fiyat değişikliğinden etkilenmezsiniz. Sipariş anındaki fiyat geçerlidir. 
              Ancak kampanya ve indirimler sınırlı sürelidir ve stok durumuna göre değişebilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Ücret İadesi Yöntemi</h2>
            <p className="leading-relaxed mb-3">İade ödemeleri aşağıdaki şekillerde yapılır:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kredi kartına iade (5-7 iş günü)</li>
              <li>Banka hesabına havale (3-5 iş günü)</li>
              <li>Bir sonraki siparişte kullanılmak üzere kredi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Mücbir Sebepler</h2>
            <p className="leading-relaxed">
              Doğal afetler, pandemi, grev gibi mücbir sebeplerden kaynaklanan gecikmeler ve iptallerden 
              TemizPro sorumlu tutulamaz. Bu gibi durumlarda müşterilerimizi en kısa sürede bilgilendiririz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Müşteri Hizmetleri</h2>
            <p className="leading-relaxed">
              İptal ve iade konularında yardım için:
              <br />
              <strong>Telefon:</strong> 0850 123 45 67 (Pazartesi-Pazar: 08:00-22:00)
              <br />
              <strong>WhatsApp:</strong> 0530 123 45 67
              <br />
              <strong>E-posta:</strong> <a href="mailto:destek@haliyikama.com" className="text-purple-600 hover:underline">destek@haliyikama.com</a>
            </p>
          </section>

          <section className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">💡 İpucu</h3>
            <p className="text-sm">
              Planlarınız değişirse, mümkün olan en kısa sürede iptal işlemi yaparak ücret kesintisinden kaçınabilirsiniz. 
              Müşteri memnuniyeti bizim için önemlidir, her zaman sizinle çözüm odaklı çalışırız.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
