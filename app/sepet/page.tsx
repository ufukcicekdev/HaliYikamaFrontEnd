'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Proceed to checkout
    setIsProcessing(true);
    router.push('/checkout');
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

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
            <p className="mt-2 text-gray-600">
              {items.length > 0 ? `${items.length} ürün sepetinizde` : 'Sepetiniz boş'}
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart */
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <ShoppingCartIcon className="mx-auto h-24 w-24 text-gray-400" />
              <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                Sepetiniz Boş
              </h2>
              <p className="mt-2 text-gray-600">
                Hizmetlerimize göz atın ve sepetinize ürün ekleyin
              </p>
              <Link
                href="/kategoriler"
                className="mt-6 inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Hizmetleri Görüntüle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.subtypeName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.categoryName}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-sm text-gray-600">Miktar:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <MinusIcon className="h-4 w-4 text-gray-700" />
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <PlusIcon className="h-4 w-4 text-gray-700" />
                            </button>
                            <span className="text-sm text-gray-600 ml-2">
                              {getPricingLabel(item.pricingType)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {(item.total || (item.quantity * (item.unitPrice || 0))).toFixed(2)} ₺
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(item.unitPrice || 0).toFixed(2)} ₺ / {getPricingLabel(item.pricingType)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="w-full py-3 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sepeti Temizle
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Sepet Özeti
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam</span>
                      <span className="font-semibold">{getTotal().toFixed(2)} ₺</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Toplam Ürün</span>
                      <span className="font-semibold">{items.length}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Toplam</span>
                        <span>{getTotal().toFixed(2)} ₺</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'İşleniyor...' : isAuthenticated ? 'Siparişi Tamamla' : 'Giriş Yap ve Devam Et'}
                      </button>
                    </div>

                    {!isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Siparişinizi tamamlamak için giriş yapmanız gerekmektedir
                      </p>
                    )}

                    <Link
                      href="/kategoriler"
                      className="block w-full py-3 text-center bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors mt-3"
                    >
                      Alışverişe Devam Et
                    </Link>
                  </div>

                  {/* Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Güvenli Alışveriş
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        256-bit SSL şifreleme
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Güvenli ödeme
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        48 saat içinde teslimat
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
