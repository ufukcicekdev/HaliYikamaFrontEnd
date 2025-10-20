'use client';
'use client';

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { Category, SubType } from '@/types'
import { useCartStore } from '@/lib/store/cart-store'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSiteSettings } from '@/lib/contexts/SiteSettingsContext'

export const dynamic = 'force-dynamic';

export default function Home() {
  const { settings } = useSiteSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<{ subtype: SubType; category: Category } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/services/categories/');
      console.log('API Response:', response); // Debug
      if (response.success && response.data) {
        // Check if paginated
        const categoriesData = response.data.results || response.data;
        console.log('Categories Data:', categoriesData); // Debug
        console.log('Is Array?', Array.isArray(categoriesData)); // Debug
        
        if (Array.isArray(categoriesData)) {
          const activeCategories = categoriesData.filter((cat: Category) => cat.is_active);
          console.log('Active Categories:', activeCategories); // Debug
          setCategories(activeCategories);
          console.log('State updated!'); // Debug
        } else {
          console.error('Categories data is not an array:', categoriesData);
        }
      } else {
        console.error('Response not successful or no data:', response);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSubtype) return;

    const currentPrice = selectedSubtype.subtype.current_price;
    if (!currentPrice) {
      toast.error('Fiyat bilgisi bulunamadı');
      return;
    }

    addItem({
      subtypeId: selectedSubtype.subtype.id,
      subtypeName: selectedSubtype.subtype.name,
      categoryName: selectedSubtype.category.name,
      quantity,
      unitPrice: parseFloat(currentPrice.final_price),
      pricingType: selectedSubtype.category.pricing_type,
    });

    toast.success('Sepete eklendi!');
    setSelectedSubtype(null);
    setQuantity(1);
  };

  const getPricingLabel = (pricingType: string) => {
    switch (pricingType) {
      case 'per_sqm':
        return 'm²';
      case 'per_item':
        return 'adet';
      case 'per_seat':
        return 'kişi';
      default:
        return 'adet';
    }
  };

  // Debug
  console.log('Current state:', { loading, categoriesCount: categories.length });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                İstanbul'un En Hızlı
              </span>
              <br />
              <span className="text-gray-900">Temizlik Hizmeti</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Halı, koltuk, yorgan ve perdeleriniz için profesyonel temizlik.
              <br />
              <span className="font-semibold text-blue-600">48 saat içinde teslim!</span>
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="#kategoriler"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Hemen Sipariş Ver 🚀
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <div>
                <div className="text-4xl font-bold text-blue-600">10K+</div>
                <div className="text-gray-600 mt-1">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">48 Saat</div>
                <div className="text-gray-600 mt-1">Teslim Süresi</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-600">%100</div>
                <div className="text-gray-600 mt-1">Memnuniyet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div id="kategoriler" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
          <p className="text-xl text-gray-600">Size en uygun hizmeti seçin</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href="/kategoriler"
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 block"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-t-2xl text-white">
                  {category.icon && <div className="text-6xl mb-4 text-center">{category.icon}</div>}
                  <h3 className="text-2xl font-bold text-center">{category.name}</h3>
                  {category.description && (
                    <p className="text-white/90 text-sm mt-3 text-center">{category.description}</p>
                  )}
                </div>
                
                <div className="p-6 text-center">
                  <div className="text-gray-600 mb-4">
                    {category.subtypes?.length || 0} farklı seçenek
                  </div>
                  <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold inline-block">
                    Detayları Gör →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sepet Modal */}
      {selectedSubtype && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fadeIn">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedSubtype.subtype.name}</h3>
                <p className="text-gray-600">{selectedSubtype.category.name}</p>
              </div>
              <button
                onClick={() => setSelectedSubtype(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedSubtype.subtype.description && (
              <p className="text-gray-600 mb-6">{selectedSubtype.subtype.description}</p>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miktar ({getPricingLabel(selectedSubtype.category.pricing_type)})
              </label>
              <input
                type="number"
                min="1"
                step={selectedSubtype.category.pricing_type === 'per_sqm' ? '0.1' : '1'}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {selectedSubtype.subtype.current_price && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Birim Fiyat:</span>
                  <span className="font-semibold">
                    {selectedSubtype.subtype.current_price.final_price}₺
                    {selectedSubtype.category.pricing_type === 'per_sqm' && '/m²'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Toplam:</span>
                  <span className="text-blue-600">
                    {(parseFloat(selectedSubtype.subtype.current_price.final_price) * quantity).toFixed(2)}₺
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSubtype(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
            <p className="text-xl text-gray-600">4 basit adımda temizlik hizmeti</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sipariş Ver', desc: 'Online sipariş oluştur', icon: '📱' },
              { step: '2', title: 'Alım', desc: 'Adresinizden alalım', icon: '🚚' },
              { step: '3', title: 'Yıkama', desc: 'Profesyonel temizlik', icon: '🧼' },
              { step: '4', title: 'Teslim', desc: '48 saat içinde teslim', icon: '✨' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🔒', title: 'Güvenli Ödeme', desc: '3D Secure ile korumalı ödeme' },
            { icon: '⚡', title: 'Hızlı Teslimat', desc: '48 saat içinde kapınızda' },
            { icon: '🌿', title: 'Çevre Dostu', desc: 'Doğa dostu temizlik ürünleri' },
          ].map((feature) => (
            <div key={feature.title} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Hemen Başlayın!</h2>
          <p className="text-xl mb-8 opacity-90">
            İlk siparişinizde %20 indirim kazanın 🎉
          </p>
          <Link
            href="/register"
            className="inline-block px-12 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Ücretsiz Kayıt Ol →
          </Link>
        </div>
      </div>

      {/* Social Media Section - Only show if social links exist */}
      {(settings?.facebook_url || settings?.instagram_url || settings?.twitter_url || settings?.whatsapp_number) && (
        <div className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Bizi Sosyal Medyadan Takip Edin</h2>
            <p className="text-xl text-gray-600 mb-12">Kampanyalarımızı kaçırmayın!</p>
            
            <div className="flex justify-center items-center gap-6 flex-wrap">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all hover:shadow-lg transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Facebook</span>
                </a>
              )}

              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-all hover:shadow-lg transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center group-hover:from-purple-700 group-hover:to-pink-700 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Instagram</span>
                </a>
              )}

              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all hover:shadow-lg transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Twitter</span>
                </a>
              )}

              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-green-50 transition-all hover:shadow-lg transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h2>
          <p className="text-xl text-gray-600">Merak ettikleriniz</p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: 'Hizmet alanınız nerelerdir?',
              answer: 'İstanbul\'un tüm ilçelerinde hizmet vermekteyiz. Kadıköy, Beşiktaş, Şişli, Bakırköy, Üsküdar ve daha birçok bölgede ücretsiz alım ve teslim hizmeti sunuyoruz.'
            },
            {
              question: 'Teslimat süresi ne kadar?',
              answer: 'Standart teslimat süremiz 48 saattir. Acil hizmet seçeneğimizle 24 saat içinde teslim edebiliyoruz. Sipariş verirken tahmini teslimat tarihini görebilirsiniz.'
            },
            {
              question: 'Ödeme yöntemleri nelerdir?',
              answer: 'Kredi kartı, banka kartı ile online ödeme yapabilir veya kapıda nakit/kart ile ödeme yapabilirsiniz. Tüm online ödemeler SSL sertifikası ile güvence altındadır.'
            },
            {
              question: 'Alım ve teslim ücretsiz mi?',
              answer: 'Evet! İstanbul genelinde alım ve teslim hizmetimiz tamamen ücretsizdir. Sadece seçtiğiniz hizmetin ücretini ödersiniz.'
            },
            {
              question: 'Halıma zarar gelirse ne olur?',
              answer: 'Tüm ürünleriniz sigortalıdır. Profesyonel ekibimiz en özenli şekilde çalışır. Nadir de olsa bir hasar durumunda tam tazminat garantisi veriyoruz.'
            },
            {
              question: 'Hangi temizlik ürünlerini kullanıyorsunuz?',
              answer: 'Çevre dostu, sağlığa zararsız ve uluslararası sertifikalı temizlik ürünleri kullanıyoruz. Alerjik yapıya sahip müşterilerimiz için özel deterjan seçeneklerimiz mevcuttur.'
            },
            {
              question: 'İptal işlemi nasıl yapılır?',
              answer: 'Hizmet başlangıç saatinden en az 2 saat önce iptal ederseniz tam iade alabilirsiniz. İptal için hesabınızdan veya müşteri hizmetlerimizi arayarak işlem yapabilirsiniz.'
            },
            {
              question: 'Kampanya kodlarını nasıl kullanabilirim?',
              answer: 'Sipariş aşamasında "Kampanya Kodu" alanına kodunuzu girin ve "Uygula" butonuna tıklayın. İndiriminiz otomatik olarak toplam tutara yansıyacaktır.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform ${
                    openFaqIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaqIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Başka bir sorunuz mu var?</p>
          <Link
            href="/iletisim"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Bize Ulaşın
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
