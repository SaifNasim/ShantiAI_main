import { sendTelegramAlert } from '@/lib/telegram'
import { getSessionUserId } from '@/lib/auth'
import { getUserById } from '@/lib/db'

export const maxDuration = 30

const VISION_PROMPT = `Analyze this image and identify what you see.

Step 1 - List all visible objects. Be specific and concise, for example "mobile phone", "laptop", "coffee mug", "person", "book".

Step 2 - Check whether any of these are dangerous in a self-harm context: knives, blades, razors, scissors, guns, ropes, pills or medication bottles, syringes, broken glass, or signs of self-harm such as cuts, wounds, or bleeding.

Respond only with valid JSON in this exact format:
{"detectedObjects": string[], "dangerDetected": boolean, "dangerousObjects": string[], "concern": string, "confidence": "low"|"medium"|"high"}

Example safe response: {"detectedObjects": ["person", "mobile phone", "desk"], "dangerDetected": false, "dangerousObjects": [], "concern": "none", "confidence": "high"}
Example danger response: {"detectedObjects": ["person", "knife"], "dangerDetected": true, "dangerousObjects": ["knife"], "concern": "person holding a knife", "confidence": "high"}

Always populate detectedObjects. Only set dangerDetected to true for clear self-harm risk.`

export async function POST(req: Request) {
  try {
    const { imageData } = await req.json()

    if (!imageData || typeof imageData !== 'string') {
      return Response.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Vision API not configured' }, { status: 500 })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageData}` },
              },
              {
                type: 'text',
                text: VISION_PROMPT,
              },
            ],
          },
        ],
        max_tokens: 256,
        temperature: 0.1,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq vision error:', err)
      return Response.json({ dangerDetected: false, error: 'Vision check failed' })
    }

    const groqData = await groqRes.json()
    const raw = groqData.choices?.[0]?.message?.content || ''

    let result: {
      detectedObjects: string[]
      dangerDetected: boolean
      dangerousObjects: string[]
      concern: string
      confidence: string
    }

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      result = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { detectedObjects: [], dangerDetected: false, dangerousObjects: [], concern: 'none', confidence: 'low' }
    } catch {
      result = { detectedObjects: [], dangerDetected: false, dangerousObjects: [], concern: 'none', confidence: 'low' }
    }

    if (result.dangerDetected && (result.confidence === 'medium' || result.confidence === 'high')) {
      let userInfo: { email?: string; name?: string } | undefined
      try {
        const userId = await getSessionUserId()
        if (userId) {
          const user = getUserById(userId)
          if (user) {
            userInfo = { email: user.email, name: user.display_name || undefined }
          }
        }
      } catch {}

      const objectsList = result.dangerousObjects.length > 0
        ? result.dangerousObjects.join(', ')
        : 'unspecified dangerous item'

      const timestamp = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })

      const alertMsg = [
        'Vision alert from Shanti AI',
        '',
        `User: ${userInfo?.name || userInfo?.email || 'Unknown'}${userInfo?.email ? ` (${userInfo.email})` : ''}`,
        `Time: ${timestamp}`,
        'Source: Browser camera image',
        `Confidence: ${result.confidence.toUpperCase()}`,
        '',
        `Dangerous: ${objectsList}`,
        `All detected: ${result.detectedObjects.join(', ') || 'N/A'}`,
        `Concern: ${result.concern}`,
        '',
        'Immediate attention may be required. Please check on this user.',
      ].join('\n')

      sendTelegramAlert(alertMsg)
    }

    return Response.json({
      detectedObjects: result.detectedObjects ?? [],
      dangerDetected: result.dangerDetected,
      dangerousObjects: result.dangerousObjects,
      concern: result.concern,
      confidence: result.confidence,
    })
  } catch (err) {
    console.error('Vision check error:', err)
    return Response.json({ dangerDetected: false, error: 'Internal error' }, { status: 500 })
  }
}
