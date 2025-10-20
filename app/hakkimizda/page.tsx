'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function HakkimizdaPage() {
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
              
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/kategoriler" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Kategoriler
                </Link>
                <Link href="/hakkimizda" className="text-purple-600 hover:text-purple-700 font-medium transition-colors border-b-2 border-purple-600">
                  Hakkımızda
                </Link>
                <Link href="/iletisim" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  İletişim
                </Link>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <Link
                href="/login"
                className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Hakkımızda</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Biz Kimiz?</h2>
            <p className="text-gray-600 leading-relaxed">
              TemizPro olarak, 2020 yılından bu yana İstanbul genelinde profesyonel halı, koltuk ve yorgan yıkama hizmetleri sunmaktayız. 
              Modern ekipmanlarımız ve deneyimli ekibimizle, evinizin temizliğini güvenle bize emanet edebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Misyonumuz</h2>
            <p className="text-gray-600 leading-relaxed">
              Müşterilerimize en yüksek kalitede temizlik hizmeti sunmak, çevre dostu ürünler kullanarak sağlıklı yaşam alanları oluşturmak 
              ve güvenilir hizmet anlayışımızla sektörde öncü olmaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Neden Bizi Seçmelisiniz?</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Profesyonel ve deneyimli ekip</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Modern ve çevre dostu temizlik teknolojileri</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ücretsiz alım ve teslim hizmeti</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>7/24 müşteri desteği</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Uygun fiyat garantisi</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hizmet Bölgelerimiz</h2>
            <p className="text-gray-600 leading-relaxed">
              İstanbul'un tüm ilçelerinde hizmet vermekteyiz. Kadıköy, Beşiktaş, Şişli, Bakırköy, Üsküdar ve daha birçok bölgede 
              güvenilir temizlik hizmetimizden yararlanabilirsiniz.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
