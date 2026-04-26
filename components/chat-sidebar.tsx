'use client'

import { useState } from 'react'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatsCard } from '@/components/stats-card'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  title: string
  created_at: string
  points_earned: number
}

interface Profile {
  display_name: string | null
  total_points: number
  current_streak: number
  longest_streak: number
  level: number
}

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId: string | null
  profile: Profile | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onSignOut: () => void
}

function groupChatsByDate(chats: Chat[]) {
  const groups: { label: string; chats: Chat[] }[] = []
  const today: Chat[] = []
  const yesterday: Chat[] = []
  const thisWeek: Chat[] = []
  const older: Chat[] = []

  chats.forEach((chat) => {
    const date = new Date(chat.created_at)
    if (isToday(date)) {
      today.push(chat)
    } else if (isYesterday(date)) {
      yesterday.push(chat)
    } else if (isThisWeek(date)) {
      thisWeek.push(chat)
    } else {
      older.push(chat)
    }
  })

  if (today.length > 0) groups.push({ label: 'Today', chats: today })
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', chats: yesterday })
  if (thisWeek.length > 0) groups.push({ label: 'This Week', chats: thisWeek })
  if (older.length > 0) groups.push({ label: 'Older', chats: older })

  return groups
}

export function ChatSidebar({
  chats,
  currentChatId,
  profile,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onSignOut,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)
  const groupedChats = groupChatsByDate(chats)

  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-sm truncate max-w-[120px]">
              {profile?.display_name || 'User'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Stats */}
        {profile && (
          <StatsCard
            points={profile.total_points}
            streak={profile.current_streak}
            longestStreak={profile.longest_streak}
            level={profile.level}
            compact
          />
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-3">
        {groupedChats.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No conversations yet
          </div>
        ) : (
          groupedChats.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                {group.label}
              </p>
              {group.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-1',
                    currentChatId === chat.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  )}
                  onClick={() => onSelectChat(chat.id)}
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="flex-1 truncate text-sm">{chat.title}</span>
                  {chat.points_earned > 0 && (
                    <span className="text-xs text-points">+{chat.points_earned}</span>
                  )}
                  {hoveredChat === chat.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>

      {/* Sign Out */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
