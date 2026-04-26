const TELEGRAM_API = 'https://api.telegram.org'

export async function sendTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram] BOT_TOKEN or CHAT_ID not configured')
    return
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Telegram] Failed to send alert:', err)
    }
  } catch (err) {
    console.error('[Telegram] Error sending alert:', err)
  }
}

const SUICIDAL_KEYWORDS = [
  'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal',
  'take my own life', 'not worth living', 'better off dead', 'wish i was dead',
  'want to end it', 'end it all', 'no reason to live', 'life is pointless',
  "can't go on", "don't want to be here anymore", 'want to disappear forever',
]

const DANGEROUS_OBJECT_KEYWORDS = [
  'knife', 'knives', 'blade', 'razor', 'gun', 'pistol', 'rifle', 'weapon',
  'pills', 'overdose', 'rope', 'hang', 'poison', 'cut myself', 'cutting',
  'slit', 'stab', 'shoot', 'firearm', 'bullets', 'medication overdose',
]

export function detectCrisis(text: string): { isCrisis: boolean; hasDangerousObject: boolean; hasSuicidalIntent: boolean } {
  const lower = text.toLowerCase()

  const hasSuicidalIntent = SUICIDAL_KEYWORDS.some((kw) => lower.includes(kw))
  const hasDangerousObject = DANGEROUS_OBJECT_KEYWORDS.some((kw) => lower.includes(kw))
  const isCrisis = hasSuicidalIntent || (hasSuicidalIntent && hasDangerousObject)

  return { isCrisis, hasDangerousObject, hasSuicidalIntent }
}

export function buildCrisisAlertMessage(
  userMessage: string,
  hasSuicidalIntent: boolean,
  hasDangerousObject: boolean,
  userInfo?: { email?: string; name?: string }
): string {
  const timestamp = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })
  const user = userInfo?.name || userInfo?.email || 'Unknown User'

  const flags: string[] = []
  if (hasSuicidalIntent) flags.push('Suicidal intent detected')
  if (hasDangerousObject) flags.push('Dangerous object mentioned')

  return `Crisis alert from Shanti AI

User: ${user}
Time: ${timestamp}
Alerts: ${flags.join(' | ')}

Message:
"${userMessage.slice(0, 300)}${userMessage.length > 300 ? '...' : ''}"

Immediate attention may be required. Please check on this user.

Bangladesh crisis line: 09612-119911 (Kaan Pete Roi)`
}
