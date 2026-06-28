'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { getGreeting } from '@/lib/utils/date'
import { Bell, Zap } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const { user, isGuest } = useAuth()
  const greeting = getGreeting()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3A] bg-[#13131A]/80 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-bold text-[#F0F0FF]">
          {greeting},{' '}
          <span className="gradient-text">
            {user?.displayName?.split(' ')[0] || (isGuest ? 'Guest' : 'there')}
          </span>
        </h1>
        <p className="text-xs text-[#8B8BA7]">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/ai-center"
          id="header-ai-btn"
          className="inline-flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
        >
          <Zap className="w-3.5 h-3.5" />
          AI Analysis
        </Link>
      </div>
    </header>
  )
}
