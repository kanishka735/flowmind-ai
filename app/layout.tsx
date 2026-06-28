import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowMind AI — Your AI Productivity Partner',
  description: 'An AI-powered productivity companion that helps you complete tasks before deadlines — not just remind you. Powered by Google Gemini.',
  keywords: ['productivity', 'AI', 'task management', 'Gemini AI', 'deadline tracker'],
  openGraph: {
    title: 'FlowMind AI',
    description: 'Stop missing deadlines. Start completing them.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="animated-bg min-h-screen">{children}</body>
    </html>
  )
}
