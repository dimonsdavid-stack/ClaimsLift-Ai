import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClaimLift.ai | Autonomous AI Revenue Recovery',
  description: 'Find denied, delayed, underpaid, and at-risk claims; prioritize recoverable revenue; automate revenue recovery operations.',
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
