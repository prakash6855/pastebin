import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pastebin-Lite',
  description: 'Create and share text pastes securely with optional expiration and view limits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}