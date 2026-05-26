import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { APP_NAME, APP_TAGLINE } from '@/lib/brand'
import './globals.css'

// Removed Google Fonts to avoid build failures in restricted network environments.

export const metadata: Metadata = {
  title: `${APP_NAME} - Professional Web Hosting`,
  description: APP_TAGLINE,
  keywords: ['web hosting', 'deployment', 'Coolify', 'PaaS', 'DevOps', 'platform'],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} - Professional Web Hosting`,
    description: APP_TAGLINE,
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
