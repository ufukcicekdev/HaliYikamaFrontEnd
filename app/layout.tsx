import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'
import FirebaseServiceWorkerRegistration from '@/components/FirebaseServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Halı, Koltuk ve Ev Tekstili Yıkama | İstanbul',
  description: 'İstanbul genelinde profesyonel halı, koltuk ve ev tekstili yıkama hizmeti. Online rezervasyon, anlık randevu, güvenli ödeme.',
  keywords: 'halı yıkama, koltuk yıkama, perde yıkama, istanbul, ev tekstili temizliği',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Halı Yıkama',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="application-name" content="Halı Yıkama" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Halı Yıkama" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.variable}>
        <Providers>
          <FirebaseServiceWorkerRegistration />
          {children}
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
