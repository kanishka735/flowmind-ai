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
      {/* Remove animated-bg: background-size 400% on every page is unnecessary overhead */}
      <body className="min-h-screen bg-[#0A0A0F] text-[#F0F0FF]">{children}</body>
    </html>
  )
}
