'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Handshake,
  LayoutDashboard,
  MessageCircle,
  Smile,
  BookOpen,
  Wind,
  Phone,
  BarChart3,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
} from 'lucide-react'
import { useState } from 'react'

interface DashboardSidebarProps {
  profile: {
    display_name: string | null
    total_points: number
    level: number
    current_streak: number
  } | null
  onClose?: () => void
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Talk to Shanti AI' },
  { href: '/dashboard/mood', icon: Smile, label: 'Mood Tracker' },
  { href: '/dashboard/journal', icon: BookOpen, label: 'Journal' },
  { href: '/dashboard/breathing', icon: Wind, label: 'Breathing' },
  { href: '/dashboard/insights', icon: BarChart3, label: 'Insights' },
  { href: '/dashboard/resources', icon: Phone, label: 'Resources' },
  { href: '/dashboard/safety', icon: ShieldAlert, label: 'Safety Check', danger: true },
]

export function DashboardSidebar({ profile, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  if (collapsed) {
    return (
      <div className="w-16 h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="text-sidebar-foreground hover:bg-sidebar-accent mb-2"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Handshake className="w-5 h-5 text-primary" />
        </div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-sidebar-foreground hover:bg-sidebar-accent',
                isActive(item.href) && 'bg-sidebar-accent text-primary',
                item.danger && !isActive(item.href) && 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                item.danger && isActive(item.href) && 'bg-red-500/10 text-red-400',
              )}
            >
              <item.icon className="w-5 h-5" />
            </Button>
          </Link>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">Shanti AI</h1>
              <p className="text-xs text-muted-foreground">Mental wellness support</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
                  item.danger
                    ? isActive(item.href)
                      ? 'bg-red-500/10 text-red-400 font-medium'
                      : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : isActive(item.href)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive(item.href) && !item.danger && 'text-primary')} />
                {item.label}
                {item.danger && (
                  <span className="ml-auto text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1 py-0.5">LIVE</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {profile && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-card/50">
            <Avatar className="h-9 w-9 bg-primary/20 border-2 border-primary/30">
              <AvatarFallback className="bg-transparent">
                <User className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.display_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">Level {profile.level} · {profile.total_points} pts</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
