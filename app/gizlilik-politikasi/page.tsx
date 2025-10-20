'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function GizlilikPolitikasiPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Gizlilik Politikası</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Son Güncellenme: {new Date().toLocaleDateString('tr-TR')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Genel Bilgiler</h2>
            <p className="leading-relaxed">
              Bu Gizlilik Politikası, TemizPro olarak toplad​ığımız kişisel verilerin nasıl işlendiğini, 
              korunduğunu ve kullanıldığını açıklamaktadır. Hizmetlerimizi kullanarak bu politikayı kabul etmiş olursunuz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Toplanan Bilgiler</h2>
            <p className="leading-relaxed mb-3">Hizmetlerimizi sunabilmek için aşağıdaki bilgileri toplayabiliriz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Ad, soyad ve iletişim bilgileri</li>
              <li>E-posta adresi ve telefon numarası</li>
              <li>Teslimat adresi bilgileri</li>
              <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları üzerinden)</li>
              <li>Hizmet tercihleri ve sipariş geçmişi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="leading-relaxed mb-3">Toplanan bilgiler aşağıdaki amaçlarla kullanılır:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Hizmet siparişlerinizi işlemek ve teslim etmek</li>
              <li>Size daha iyi hizmet sunmak ve deneyiminizi iyileştirmek</li>
              <li>Müşteri destek hizmetleri sağlamak</li>
              <li>Kampanyalar ve özel teklifler hakkında bilgilendirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Bilgilerin Korunması</h2>
            <p className="leading-relaxed">
              Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanmaktayız. 
              Verileriniz şifreli olarak saklanır ve yetkisiz erişime karşı korunur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Çerezler (Cookies)</h2>
            <p className="leading-relaxed">
              Web sitemiz, kullanıcı deneyimini iyileştirmek ve site trafiğini analiz etmek için çerezler kullanmaktadır. 
              Tarayıcı ayarlarınızdan çerezleri yönetebilir veya reddedebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Üçüncü Taraf Paylaşımı</h2>
            <p className="leading-relaxed">
              Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. Ödeme işlemleri için 
              güvenli ödeme sağlayıcıları kullanılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Haklarınız</h2>
            <p className="leading-relaxed mb-3">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>Verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              <li>İşleme faaliyetlerine itiraz etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. İletişim</h2>
            <p className="leading-relaxed">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              <br />
              E-posta: <a href="mailto:kvkk@haliyikama.com" className="text-purple-600 hover:underline">kvkk@haliyikama.com</a>
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
