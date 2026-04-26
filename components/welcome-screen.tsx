'use client'

import { Handshake, Heart, MessageCircle, Shield, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: 'Empathetic Listening',
    description: 'Share your thoughts without judgment',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Support',
    description: 'Instant responses powered by AI',
  },
  {
    icon: Shield,
    title: 'Safe Space',
    description: 'Your conversations are private',
  },
  {
    icon: Sparkles,
    title: 'Always Available',
    description: 'Here for you 24/7',
  },
]

const conversationStarters = [
  "I've been feeling overwhelmed lately...",
  "I need someone to talk to about...",
  "I'm struggling with anxiety about...",
  "I've been having trouble sleeping because...",
]

interface WelcomeScreenProps {
  onSelectPrompt: (text: string) => void
}

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
        <Handshake className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-3xl font-semibold text-foreground mb-2 text-balance">
        Welcome to Shanti AI
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 text-pretty">
        Your compassionate AI companion. I&apos;m here to listen, support, and help you navigate life&apos;s challenges.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-10 max-w-md w-full">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/50 shadow-sm"
          >
            <feature.icon className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-sm font-medium text-card-foreground">{feature.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        <p className="text-sm text-muted-foreground mb-3">Try starting with:</p>
        <div className="flex flex-col gap-2">
          {conversationStarters.map((starter) => (
            <button
              key={starter}
              onClick={() => onSelectPrompt(starter)}
              className="text-left px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
