'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useRef, useEffect, useState, useCallback, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  input?: string
  setInput: (value: string) => void
  onSend: () => void
  isLoading?: boolean
  ttsEnabled: boolean
  onToggleTts: () => void
  isSpeaking: boolean
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function ChatInput({ input = '', setInput, onSend, isLoading = false, ttsEnabled, onToggleTts, isSpeaking }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [sttSupported, setSttSupported] = useState(false)

  useEffect(() => {
    setSttSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input?.trim() && !isLoading) {
        onSend()
      }
    }
  }

  const toggleListening = useCallback(() => {
    if (!sttSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)
      if (event.results[event.results.length - 1].isFinal) {
        setTimeout(() => onSend(), 400)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, sttSupported, setInput, onSend])

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 bg-input rounded-2xl p-2 border border-border/50">
          {/* TTS Toggle */}
          <Button
            type="button"
            onClick={onToggleTts}
            size="icon"
            variant="ghost"
            className={cn(
              'h-10 w-10 shrink-0 rounded-xl transition-colors',
              ttsEnabled ? 'text-primary' : 'text-muted-foreground'
            )}
            title={ttsEnabled ? 'Mute Shanti AI voice' : 'Enable Shanti AI voice'}
          >
            {isSpeaking ? (
              <Volume2 className="h-4 w-4 animate-pulse text-primary" />
            ) : ttsEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : "Share what's on your mind..."}
            disabled={isLoading}
            className="min-h-11 max-h-50 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] leading-relaxed placeholder:text-muted-foreground/60"
            rows={1}
          />

          {/* STT Mic Button */}
          {sttSupported && (
            <Button
              type="button"
              onClick={toggleListening}
              size="icon"
              variant="ghost"
              disabled={isLoading}
              className={cn(
                'h-10 w-10 shrink-0 rounded-xl transition-colors',
                isListening
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
                  : 'text-muted-foreground hover:text-primary'
              )}
              title={isListening ? 'Stop listening' : 'Speak your message'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          {/* Send Button */}
          <Button
            onClick={onSend}
            disabled={!input?.trim() || isLoading}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Shanti AI is here to listen and support you. For crisis situations, please contact a mental health professional.
        </p>
      </div>
    </div>
  )
}
