import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { CartDrawer } from '@/components/cart/CartDrawer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  variable: '--fraunces',
  display: 'swap',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: {
    default: 'Bedo Fish - Roasted Tilapia Delivered Fresh',
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
      {
        url: '/images/bedo_favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/images/bedo_favicon.svg',
    apple: '/images/bedo_favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-body">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
