'use client'

import type { UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Handshake, User } from 'lucide-react'

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'

  const textContent = message.parts
    ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('') || ''

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 animate-fade-in',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <Avatar className="h-9 w-9 shrink-0 bg-primary/20 border-2 border-primary/30">
          <AvatarFallback className="bg-transparent">
            <Handshake className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
          isAssistant
            ? 'bg-assistant-bubble text-foreground border border-border/50'
            : 'bg-user-bubble text-primary-foreground'
        )}
      >
        <p className="whitespace-pre-wrap">{textContent}</p>
      </div>

      {!isAssistant && (
        <Avatar className="h-9 w-9 shrink-0 bg-muted border-2 border-border">
          <AvatarFallback className="bg-transparent">
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
