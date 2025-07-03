import { type ReactNode } from 'react'
import { type Metadata } from 'next'
import Internal from '@paracosm-dev/internal'
import metadataProfile from '@/profile/metadata.json'
import './globals.css'

export const metadata: Metadata = metadataProfile['/']

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Internal />
        {children}
      </body>
    </html>
  )
}
