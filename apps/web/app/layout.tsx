import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SplashLoader } from '@/components/ui/SplashLoader'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--instrument-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bedofish.com'),
  title: {
    default: 'Bedo Fish | Roasted Tilapia Delivered Fresh!',
    template: '%s | Bedo Fish',
  },
  description:
    'Order fresh sustainably roasted tilapia from Lake Victoria. Bedo Fish empowers women processors and delivers premium fish to your door. Free delivery in Nairobi on orders above KES 1,500.',
  openGraph: {
    type: 'website',
    url: 'https://bedofish.com',
    siteName: 'Bedo Fish',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/images/favicon.png', type: 'image/png' },
    ],
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable} antialiased`}>
      <body className="font-body">
        <Providers>
          <SplashLoader />
          <Navbar />
          <main className="pt-16">{children}</main>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
