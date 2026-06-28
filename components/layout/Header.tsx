'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { getGreeting } from '@/lib/utils/date'
import { Zap, Menu, X } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export function Header({ onMenuToggle, sidebarOpen }: HeaderProps) {
  const { user, isGuest } = useAuth()
  const greeting = getGreeting()

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#2A2A3A] bg-[#13131A]/80 backdrop-blur-sm">

      {/* Left: mobile menu toggle + greeting */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only shown on mobile */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="lg:hidden flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#8B8BA7] hover:text-[#F0F0FF] hover:bg-white/5 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-bold text-[#F0F0FF] leading-tight truncate">
            {greeting},{' '}
            <span className="gradient-text">
              {user?.displayName?.split(' ')[0] || (isGuest ? 'Guest' : 'there')}
            </span>
          </h1>
          <p className="text-xs text-[#8B8BA7] leading-tight hidden sm:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right: AI Analysis shortcut */}
      <div className="flex-shrink-0">
        <Link
          href="/ai-center"
          id="header-ai-btn"
          className="inline-flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap"
        >
          <Zap className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">AI Analysis</span>
          <span className="sm:hidden">AI</span>
        </Link>
      </div>
    </header>
  )
}
