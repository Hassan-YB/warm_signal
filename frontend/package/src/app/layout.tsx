import { Poppins } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/app/components/Layout/Header'
import Footer from '@/app/components/Layout/Footer'
import ScrollToTop from '@/app/components/ScrollToTop'
import Aoscompo from '@/utils/aos'
import ToasterContext from '@/app/api/contex/ToasetContex'

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Signal Trace',
  description: 'Signal Trace Application',
  icons: {
    icon: '/images/favicon/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${font.className}`}>
        <Aoscompo>
          <Header />
          {children}
          <Footer />
        </Aoscompo>
        <ScrollToTop />
        <ToasterContext />
      </body>
    </html>
  )
}
