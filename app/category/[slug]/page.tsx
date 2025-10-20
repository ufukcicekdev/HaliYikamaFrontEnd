'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useCartStore } from '@/lib/store/cart-store';
import { toast } from 'react-hot-toast';

interface SubType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  base_price: string;
  min_quantity?: number;
  max_quantity?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  pricing_type: 'per_sqm' | 'per_item';
  subtypes: SubType[];
}

interface SubtypeQuantity {
  [key: number]: {
    count: number;  // adet
    size: number;   // m² or additional quantity
  };
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<SubtypeQuantity>({});
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/services/categories/');
        
        if (response.success && response.data?.results) {
          const cats = response.data.results;
          setAllCategories(cats);
          
          // Find current category by slug
          const current = cats.find((cat: Category) => cat.slug === slug);
          if (current) {
            setCurrentCategory(current);
            // Initialize quantities to {count: 0, size: 0}
            const initialQuantities: SubtypeQuantity = {};
            current.subtypes.forEach((subtype: SubType) => {
              initialQuantities[subtype.id] = { count: 0, size: 0 };
            });
            setQuantities(initialQuantities);
          } else {
            toast.error('Kategori bulunamadı');
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Kategoriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategories();
    }
  }, [slug]);

  const incrementCount = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        count: prev[subtypeId].count + 1,
      },
    }));
  };

  const decrementCount = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        count: Math.max(0, prev[subtypeId].count - 1),
      },
    }));
  };

  const incrementSize = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        size: prev[subtypeId].size + 1,
      },
    }));
  };

  const decrementSize = (subtypeId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [subtypeId]: {
        ...prev[subtypeId],
        size: Math.max(0, prev[subtypeId].size - 1),
      },
    }));
  };

  const handleAddToCart = (subtype: SubType) => {
    const quantityData = quantities[subtype.id];
    
    if (!quantityData || (quantityData.count === 0 && quantityData.size === 0)) {
      toast.error('Lütfen önce miktar seçiniz');
      return;
    }

    // For per_sqm pricing, we need both count and size
    // For per_item pricing, we only use count
    const finalQuantity = currentCategory?.pricing_type === 'per_sqm' 
      ? quantityData.count * quantityData.size  // total m² = adet * m² per item
      : quantityData.count;

    if (finalQuantity === 0) {
      toast.error('Lütfen önce miktar seçiniz');
      return;
    }

    addItem({
      subtypeId: subtype.id,
      subtypeName: subtype.name,
      categoryName: currentCategory?.name || '',
      quantity: finalQuantity,
      unitPrice: parseFloat(subtype.base_price),
      pricingType: currentCategory?.pricing_type || 'per_item',
    });
    
    toast.success('Sepete eklendi!');
    // Reset quantity
    setQuantities((prev) => ({ ...prev, [subtype.id]: { count: 0, size: 0 } }));
  };

  const getPricingLabel = (pricingType: 'per_sqm' | 'per_item') => {
    return pricingType === 'per_sqm' ? 'm²' : 'adet';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kategori bulunamadı</h1>
          <Link href="/" className="text-purple-600 hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

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
                <Link href="/#kategoriler" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Kategoriler
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Hakkımızda
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  İletişim
                </Link>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <Link
                href="/sepet"
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                🛒
                {useCartStore.getState().getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {useCartStore.getState().getItemCount()}
                  </span>
                )}
              </Link>
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

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            {allCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  category.id === currentCategory.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subtypes Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentCategory.subtypes.map((subtype) => {
                const quantityData = quantities[subtype.id] || { count: 0, size: 0 };
                const unitPrice = parseFloat(subtype.base_price);
                const isPerSqm = currentCategory.pricing_type === 'per_sqm';
                const total = isPerSqm 
                  ? quantityData.count * quantityData.size * unitPrice  // adet * m² * price per m²
                  : quantityData.count * unitPrice;  // adet * price per item

                return (
                  <div
                    key={subtype.id}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    {/* Icon */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-3xl">🛋️</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 text-center">
                        {subtype.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {unitPrice.toFixed(0)} TL / {getPricingLabel(currentCategory.pricing_type)}
                      </p>
                    </div>

                    {isPerSqm ? (
                      // For carpets: Show both adet and m²
                      <div className="space-y-4 mb-4">
                        {/* Adet Controls */}
                        <div>
                          <div className="text-xs text-gray-600 text-center mb-2">Adet</div>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => decrementCount(subtype.id)}
                              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              disabled={quantityData.count === 0}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <div className="w-16 text-center">
                              <div className="text-2xl font-bold text-gray-900">{quantityData.count}</div>
                            </div>
                            
                            <button
                              onClick={() => incrementCount(subtype.id)}
                              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* m² Controls */}
                        <div>
                          <div className="text-xs text-gray-600 text-center mb-2">m² (her halı)</div>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => decrementSize(subtype.id)}
                              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              disabled={quantityData.size === 0}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <div className="w-16 text-center">
                              <div className="text-2xl font-bold text-gray-900">{quantityData.size}</div>
                            </div>
                            
                            <button
                              onClick={() => incrementSize(subtype.id)}
                              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // For sofas: Show only adet
                      <div className="mb-4">
                        <div className="text-xs text-gray-600 text-center mb-2">Adet</div>
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => decrementCount(subtype.id)}
                            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={quantityData.count === 0}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <div className="w-16 text-center">
                            <div className="text-2xl font-bold text-gray-900">{quantityData.count}</div>
                          </div>
                          
                          <button
                            onClick={() => incrementCount(subtype.id)}
                            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Price Display */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {total.toFixed(0)} TL
                      </div>
                      {total > 0 && (
                        <button
                          onClick={() => handleAddToCart(subtype)}
                          className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Sepete Ekle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar - Date Picker & Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Tarih</h3>
                  <p className="text-sm text-gray-500">ve Saat Seçiniz</p>
                </div>
              </div>

              {/* Simple Date Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Saat</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Saat seçiniz</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>

              {/* Sepetim Section */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>✨</span> Sepetim
                </h3>
                <div className="space-y-3 mb-4">
                  {Object.entries(quantities)
                    .filter(([_, qty]) => qty > 0)
                    .map(([subtypeId, qty]) => {
                      const subtype = currentCategory.subtypes.find(
                        (s) => s.id === parseInt(subtypeId)
                      );
                      if (!subtype) return null;
                      const itemTotal = qty * parseFloat(subtype.base_price);
                      return (
                        <div key={subtypeId} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {subtype.name} x{qty}
                          </span>
                          <span className="font-semibold">{itemTotal.toFixed(0)} TL</span>
                        </div>
                      );
                    })}
                </div>
                
                {Object.values(quantities).some(q => q > 0) && (
                  <>
                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Toplam:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {Object.entries(quantities)
                            .reduce((sum, [subtypeId, qty]) => {
                              const subtype = currentCategory.subtypes.find(
                                (s) => s.id === parseInt(subtypeId)
                              );
                              return sum + (subtype ? qty * parseFloat(subtype.base_price) : 0);
                            }, 0)
                            .toFixed(0)} TL
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/sepet"
                      className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-center"
                    >
                      Sepete Git
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
