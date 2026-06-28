'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  BarChart3,
  LogOut,
  User2,
} from 'lucide-react'
import { signOut } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/tasks',      label: 'My Tasks',           icon: CheckSquare },
  { href: '/ai-center',  label: 'AI Command Center',  icon: Sparkles, highlight: true },
  { href: '/analytics',  label: 'Analytics',          icon: BarChart3 },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user, isGuest } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    onNavigate?.()
    router.push('/')
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-[#13131A] border-r border-[#2A2A3A] p-4 overflow-y-auto">

      {/* Logo */}
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2 mb-8 mt-2 flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-base">
          <span className="gradient-text">FlowMind</span>
          <span className="text-[#F0F0FF]"> AI</span>
        </span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-purple-500/15 text-[#F0F0FF] border border-purple-500/25'
                  : 'text-[#8B8BA7] hover:text-[#F0F0FF] hover:bg-white/5',
                item.highlight && !isActive && 'border border-dashed border-purple-500/30 hover:border-purple-500/50'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-purple-400' : item.highlight ? 'text-purple-400' : 'text-current'
                )}
              />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] font-bold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  AI
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* AI Status indicator */}
      <div className="mb-4 px-3 py-3 bg-teal-500/5 border border-teal-500/15 rounded-xl flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-semibold text-teal-400">Gemini Active</span>
        </div>
        <p className="text-xs text-[#8B8BA7]">AI ready to analyze your tasks</p>
      </div>

      {/* User profile */}
      <div className="border-t border-[#2A2A3A] pt-4 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-3 px-2">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-purple-500/30 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <User2 className="w-4 h-4 text-purple-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F0F0FF] truncate">
              {user?.displayName || (isGuest ? 'Guest User' : 'User')}
            </p>
            <p className="text-xs text-[#8B8BA7] truncate">
              {isGuest ? 'Guest session' : user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          id="btn-signout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#8B8BA7] hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
