import type { Metadata } from 'next'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Tongue Twisters Challenge',
  description: 'Improve your speech with fun tongue twisters',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider>
          <TanstackClientProvider>{children}</TanstackClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
