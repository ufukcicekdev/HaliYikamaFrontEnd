'use client';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Hesabınıza Giriş Yapın
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Kontrol panelinize erişin ve rezervasyonlarınızı yönetin
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center text-sm text-gray-600">
            <Link href="/" className="font-medium text-primary-600 hover:text-primary-500">
              ← Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
