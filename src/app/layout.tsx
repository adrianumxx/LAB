import type { Metadata, Viewport } from 'next'
import { Fraunces, Outfit } from 'next/font/google'
import './globals.css'
import { AuthSync } from '@/components/providers/AuthSync'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { getMetadataBase, SITE_DESCRIPTION } from '@/lib/site-config'

const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const fontSans = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const siteName = 'Tenant Management Platform'

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en',
    siteName,
    title: siteName,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf8' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0f14' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="it"
      className={`${fontDisplay.variable} ${fontSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prima di globals.css: sfondo e testo leggibili (evita schermo nero se CSS/JS fallisce) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
html { color-scheme: light dark; background-color: #fafaf8; color: #14181f; }
html.dark { background-color: #0c0f14; color: #f4f4f1; }
body { margin: 0; min-height: 100vh; background-color: inherit; color: inherit; }
`,
          }}
        />
      </head>
      <body className={`${fontSans.className} bg-app text-primary antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthSync />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
