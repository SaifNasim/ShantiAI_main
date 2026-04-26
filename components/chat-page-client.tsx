'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useChat, Chat as AiChat } from '@ai-sdk/react'
import { type UIMessage } from 'ai'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { TypingIndicator } from '@/components/typing-indicator'
import { MoodSelector } from '@/components/mood-selector'
import { PointsNotification } from '@/components/points-notification'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import {
  MessageSquare,
  Plus,
  Trash2,
  Handshake,
  Heart,
  Sparkles,
  Shield,
  MessageCircle,
} from 'lucide-react'
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

interface PointsEvent {
  points: number
  reason: string
}

const POINTS = {
  SESSION_START: 5,
  MESSAGE_SENT: 2,
  MOOD_CHECK: 3,
}

const starters = [
  "I've been feeling overwhelmed lately...",
  "I need someone to talk to about...",
  "I'm struggling with anxiety about...",
  "I've been having trouble sleeping...",
]

function groupChatsByDate(chats: Chat[]) {
  const groups: { label: string; chats: Chat[] }[] = []
  const today: Chat[] = []
  const yesterday: Chat[] = []
  const thisWeek: Chat[] = []
  const older: Chat[] = []

  chats.forEach((chat) => {
    const date = new Date(chat.created_at)
    if (isToday(date)) today.push(chat)
    else if (isYesterday(date)) yesterday.push(chat)
    else if (isThisWeek(date)) thisWeek.push(chat)
    else older.push(chat)
  })

  if (today.length) groups.push({ label: 'Today', chats: today })
  if (yesterday.length) groups.push({ label: 'Yesterday', chats: yesterday })
  if (thisWeek.length) groups.push({ label: 'This Week', chats: thisWeek })
  if (older.length) groups.push({ label: 'Older', chats: older })
  return groups
}

interface ChatPageClientProps {
  user: { id: string; email: string; display_name: string }
  profile: Profile | null
  initialChats: Chat[]
  moodEntriesCount: number
}

export function ChatPageClient({ user, profile: initialProfile, initialChats, moodEntriesCount }: ChatPageClientProps) {
  const [speechSupported, setSpeechSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [pointsEvent, setPointsEvent] = useState<PointsEvent | null>(null)
  const [showChatList, setShowChatList] = useState(false)
  const [input, setInput] = useState('')
  const [chatError, setChatError] = useState<string | null>(null)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Create Chat instance once — passing via `chat` prop bypasses all re-creation logic in useChat
  const chatInstanceRef = useRef<InstanceType<typeof AiChat> | null>(null)
  if (!chatInstanceRef.current) {
    chatInstanceRef.current = new AiChat<UIMessage>({ messages: [] })
  }

  const { messages, setMessages, status, sendMessage } = useChat({
    chat: chatInstanceRef.current!,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false)
      setTtsEnabled(false)
      return
    }

    setSpeechSupported(true)
    window.speechSynthesis.getVoices()

    const savedPreference = window.localStorage.getItem('shanti-ai-tts-enabled')
    if (savedPreference !== null) {
      setTtsEnabled(savedPreference === 'true')
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !speechSupported || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice =
      voices.find((voice) => voice.lang.startsWith('en')) ||
      voices.find((voice) => voice.default) ||
      voices[0]
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [speechSupported, ttsEnabled])

  const handleToggleTts = useCallback(() => {
    if (!speechSupported || typeof window === 'undefined') return
    if (ttsEnabled) window.speechSynthesis?.cancel()
    setTtsEnabled((prev) => {
      const nextValue = !prev
      window.localStorage.setItem('shanti-ai-tts-enabled', String(nextValue))
      return nextValue
    })
    setIsSpeaking(false)
  }, [speechSupported, ttsEnabled])

  const awardPoints = useCallback(async (points: number, reason: string) => {
    if (!profile) return
    setProfile((prev) => prev ? {
      ...prev,
      total_points: prev.total_points + points,
      level: Math.floor((prev.total_points + points) / 100) + 1
    } : null)
    setPointsEvent({ points, reason })
    await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points, reason }),
    })
  }, [profile])

  const handleNewChat = useCallback(() => {
    setChatError(null)
    setMessages([])
    setCurrentChatId(null)
    setShowMoodSelector(true)
    setCurrentMood(null)
    setShowChatList(false)
  }, [setMessages])

  const handleMoodSelect = useCallback(async (mood: string) => {
    setCurrentMood(mood)
    setShowMoodSelector(false)
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Session', mood_before: mood }),
    })
    const newChat = await res.json()
    if (newChat?.id) {
      setCurrentChatId(newChat.id)
      setChats((prev) => [newChat, ...prev])
      await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      })
      // Refresh profile to get updated points/streak from server
      const profileRes = await fetch('/api/auth/me')
      const profileData = await profileRes.json()
      if (profileData?.profile) setProfile(profileData.profile)
    }
  }, [])

  const handleSelectChat = useCallback(async (chatId: string) => {
    setCurrentChatId(chatId)
    setShowMoodSelector(false)
    setShowChatList(false)
    const res = await fetch(`/api/messages?chatId=${chatId}`)
    const chatMessages = await res.json()
    if (Array.isArray(chatMessages)) {
      const uiMessages: UIMessage[] = chatMessages.map((msg: { id: string; role: string; content: string; created_at: string }) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: msg.content }],
        createdAt: new Date(msg.created_at),
      }))
      setMessages(uiMessages)
    }
  }, [setMessages])

  const handleDeleteChat = useCallback(async (chatId: string) => {
    await fetch('/api/chats', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: chatId }),
    })
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (currentChatId === chatId) { setCurrentChatId(null); setMessages([]) }
  }, [currentChatId, setMessages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return
    setChatError(null)
    let chatId = currentChatId
    try {
      if (!chatId) {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: input.slice(0, 50) + (input.length > 50 ? '...' : '') }),
        })

        if (!res.ok) {
          throw new Error('Unable to create a new chat session.')
        }

        const newChat = await res.json()
        if (newChat?.id) {
          chatId = newChat.id
          setCurrentChatId(chatId)
          setChats((prev) => [newChat, ...prev])
        }
      }

      if (chatId) {
        const saveUserMessageRes = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, role: 'user', content: input }),
        })

        if (!saveUserMessageRes.ok) {
          throw new Error('Unable to save your message.')
        }
      }

      await awardPoints(POINTS.MESSAGE_SENT, 'Shared your thoughts')
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
      const msgText = input
      await sendMessage({ text: msgText })
      setInput('')

      if (chatId && messages.length === 0) {
        const title = msgText.slice(0, 50) + (msgText.length > 50 ? '...' : '')
        const updateChatRes = await fetch('/api/chats', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: chatId, title }),
        })

        if (updateChatRes.ok) {
          setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, title } : c))
        }
      }
    } catch (error) {
      console.error('Chat send failed:', error)
      setChatError(error instanceof Error ? error.message : 'Shanti AI could not respond right now.')
    }
  }, [input, isLoading, currentChatId, messages.length, awardPoints, sendMessage])

  useEffect(() => {
    if (status === 'ready' && messages.length > 0 && currentChatId) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.parts?.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map((p) => p.text).join('') || ''
        if (content) {
          fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, role: 'assistant', content }),
          })
          speak(content)
        }
      }
    }
  }, [status, messages, currentChatId, speak])

  const groupedChats = groupChatsByDate(chats)

  return (
    <div className="flex h-full">
      {/* Chat History Panel */}
      <div className={cn(
        'w-64 border-r border-border bg-card/30 flex flex-col shrink-0',
        'hidden lg:flex'
      )}>
        <div className="p-3 border-b border-border">
          <Button onClick={handleNewChat} className="w-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Session
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2 py-2">
          {groupedChats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            groupedChats.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1 px-2">{group.label}</p>
                {group.chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-0.5',
                      currentChatId === chat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                    <span className="flex-1 truncate text-sm">{chat.title}</span>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id) }}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mood Selector Modal */}
        {showMoodSelector && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="glass rounded-2xl p-6 mx-4 max-w-md w-full animate-fade-in">
              <h2 className="text-xl font-semibold text-center mb-2">How are you feeling?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Let&apos;s start by checking in with yourself</p>
              <MoodSelector value={currentMood} onChange={handleMoodSelect} />
            </div>
          </div>
        )}

        {chatError && (
          <div className="mx-auto mt-4 w-full max-w-3xl px-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {chatError}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          <div className="min-h-full">
            {messages.length === 0 && !showMoodSelector ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Talk to Shanti AI</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Your compassionate AI wellness companion. Share what&apos;s on your mind in a safe, judgment-free space.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mb-8">
                  {[
                    { icon: Heart, text: 'Empathetic listening' },
                    { icon: Shield, text: 'Private & safe space' },
                    { icon: MessageCircle, text: 'Real-time support' },
                    { icon: Sparkles, text: 'Available 24/7' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border/50">
                      <f.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{f.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">Try starting with:</p>
                <div className="flex flex-col gap-2 max-w-md w-full">
                  {starters.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s) }}
                      className="text-left px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-1 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          ttsEnabled={ttsEnabled}
          onToggleTts={handleToggleTts}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Points Notification */}
      {pointsEvent && (
        <PointsNotification
          points={pointsEvent.points}
          reason={pointsEvent.reason}
          onComplete={() => setPointsEvent(null)}
        />
      )}
    </div>
  )
}
