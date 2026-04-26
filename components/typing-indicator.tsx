'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Handshake } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar className="h-9 w-9 shrink-0 bg-primary/10 border-2 border-primary/20">
        <AvatarFallback className="bg-transparent">
          <Handshake className="h-4 w-4 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
