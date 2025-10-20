'use client';
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { apiClient } from '@/lib/api-client';
import { Category } from '@/types';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = getItemCount();

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/services/categories/');
      if (response.success && response.data) {
        const categoriesData = response.data.results || response.data;
        if (Array.isArray(categoriesData)) {
          const activeCategories = categoriesData.filter((cat: Category) => cat.is_active);
          setCategories(activeCategories);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
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
            
            {/* Kategoriler Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <button
                  onMouseEnter={() => setShowCategoriesMenu(true)}
                  onMouseLeave={() => setShowCategoriesMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Kategoriler
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCategoriesMenu && (
                  <div
                    onMouseEnter={() => setShowCategoriesMenu(true)}
                    onMouseLeave={() => setShowCategoriesMenu(false)}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href="/kategoriler"
                          onClick={() => setShowCategoriesMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                        >
                          {category.icon && <span className="text-2xl">{category.icon}</span>}
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.subtypes?.length || 0} çeşit</div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">Kategori bulunamadı</div>
                    )}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        href="/kategoriler"
                        className="block px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium text-sm"
                      >
                        Tüm Kategoriler →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link href="/hakkimizda" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                İletişim
              </Link>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Notification Bell - Only for admin users */}
            {mounted && isAuthenticated && user?.user_type === 'admin' && (
              <NotificationBell />
            )}

            {/* Cart - Only show for non-admin users */}
            {mounted && (!isAuthenticated || user?.user_type !== 'admin') && (
              <Link
                href="/sepet"
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu or Auth Buttons */}
            {mounted && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden sm:inline">{user?.first_name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                      </div>
                      
                      {user?.user_type === 'admin' ? (
                        // Admin Menu Items
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>📊</span>
                            <span className="font-medium">Dashboard</span>
                          </Link>
                          
                          <Link
                            href="/admin/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>📦</span>
                            <span className="font-medium">Siparişler</span>
                          </Link>
                          
                          <Link
                            href="/admin/customers"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>👥</span>
                            <span className="font-medium">Müşteriler</span>
                          </Link>
                          
                          <Link
                            href="/admin/reports"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>📈</span>
                            <span className="font-medium">Raporlar</span>
                          </Link>
                          
                          <Link
                            href="/admin/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>⚙️</span>
                            <span className="font-medium">Ayarlar</span>
                          </Link>
                        </>
                      ) : (
                        // Customer Menu Items
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>📊</span>
                            <span className="font-medium">Dashboard</span>
                          </Link>
                          
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>👤</span>
                            <span className="font-medium">Profil Bilgilerim</span>
                          </Link>
                          
                          <Link
                            href="/dashboard/bookings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>📦</span>
                            <span className="font-medium">Siparişlerim</span>
                          </Link>
                          
                          <Link
                            href="/dashboard/addresses"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700"
                          >
                            <span>📍</span>
                            <span className="font-medium">Adreslerim</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          <span className="font-medium">Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
