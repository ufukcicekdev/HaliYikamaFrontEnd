'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  HomeIcon, 
  UserIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  CreditCardIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to rehydrate from localStorage
  useEffect(() => {
    setMounted(true);
    // Give Zustand time to rehydrate
    const timer = setTimeout(() => {
      setIsHydrated(true);
      
      // Check if we have tokens - if not, logout
      if (isAuthenticated) {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!accessToken || !refreshToken) {
          console.warn('Auth state exists but tokens are missing. Logging out...');
          logout();
          router.push('/login');
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.user_type === 'admin') {
        // Redirect admins to admin dashboard
        router.push('/admin');
      }
    }
  }, [isAuthenticated, user, router, isHydrated]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profil Bilgilerim', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Adreslerim', href: '/dashboard/addresses', icon: MapPinIcon },
    { name: 'Siparişlerim', href: '/dashboard/siparislerim', icon: ShoppingBagIcon },
    { name: 'Ödeme Yöntemlerim', href: '/dashboard/payment-methods', icon: CreditCardIcon },
    { name: 'Bildirimler', href: '/dashboard/bildirimler', icon: BellIcon },
  ];

  if (!mounted || !isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg shadow-sm p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
