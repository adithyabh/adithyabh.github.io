import { type ReactNode } from 'react'
import { type Metadata } from 'next'
// import Internal from '@paracosm-dev/internal'  // Commented out to remove Paracosm branding
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
        {/* <Internal /> */}  {/* Commented out to remove Paracosm branding */}
        {children}
      </body>
    </html>
  )
}
