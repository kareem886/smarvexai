import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmarvexAI — Brand Intelligence Platform',
  description: 'AI-powered brand operating system for clothing brands',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
