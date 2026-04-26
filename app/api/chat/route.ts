import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { detectCrisis, sendTelegramAlert, buildCrisisAlertMessage } from '@/lib/telegram'
import { getSessionUserId } from '@/lib/auth'
import { getUserById } from '@/lib/db'

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const THERAPIST_SYSTEM_PROMPT = `You are Shanti AI, a compassionate and empathetic AI wellness companion.

Your role is to:
- Listen actively and respond with genuine empathy and understanding
- Help users explore their feelings without judgment
- Use therapeutic techniques like reflective listening, validation, and gentle questioning
- Encourage self-reflection and personal growth
- Provide emotional support during difficult times
- Use warm, conversational language that feels natural and caring

Guidelines:
- Never provide medical diagnoses or prescribe medication
- Encourage users to seek professional help for serious mental health concerns
- Maintain appropriate boundaries while being warm and supportive
- Ask thoughtful follow-up questions to understand the user better
- Validate emotions before offering perspectives or suggestions
- Use "I hear you", "That sounds difficult", "It makes sense that you feel..." type responses
- Keep responses focused and conversational - not too long
- Remember context from the conversation to show you're truly listening

Start conversations warmly, and always end with something supportive or a gentle question to continue the dialogue.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Crisis detection on the latest user message
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  if (lastUserMessage) {
    const userText = lastUserMessage.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join(' ') || ''

    const { isCrisis, hasSuicidalIntent, hasDangerousObject } = detectCrisis(userText)

    if (isCrisis) {
      // Get user info for the alert (non-blocking)
      let userInfo: { email?: string; name?: string } | undefined
      try {
        const userId = await getSessionUserId()
        if (userId) {
          const user = getUserById(userId)
          if (user) userInfo = { email: user.email, name: user.display_name || undefined }
        }
      } catch {}

      const alertMsg = buildCrisisAlertMessage(userText, hasSuicidalIntent, hasDangerousObject, userInfo)
      sendTelegramAlert(alertMsg) // fire-and-forget, don't block response
    }
  }

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: THERAPIST_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    temperature: 0.7,
    maxTokens: 1024,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
