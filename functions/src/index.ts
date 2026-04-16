import * as functions from 'firebase-functions/v1'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OccupancyInput {
  sections: Record<string, number> // { "North Stand": 92, "South Stand": 48, ... }
}

interface RoutingSuggestion {
  fromSection: string
  toGate: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

interface CrowdRoutingResponse {
  suggestions: RoutingSuggestion[]
  summary: string
  generatedAt: number
}

// ─── Cloud Function ───────────────────────────────────────────────────────────

export const getCrowdRoutingSuggestion = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(async (data: OccupancyInput, context) => {

    // Optional: require auth
    // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in')

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'GEMINI_API_KEY environment variable not set'
      )
    }

    const { sections } = data

    if (!sections || typeof sections !== 'object') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'sections must be an object mapping section names to occupancy percentages'
      )
    }

    // Validate values
    for (const [name, pct] of Object.entries(sections)) {
      if (typeof pct !== 'number' || pct < 0 || pct > 100) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Invalid occupancy percentage for "${name}": must be 0-100`
        )
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a crowd-safety AI for a large stadium. Based on the following section occupancy percentages, suggest optimal gate redirections to balance crowd flow and prevent dangerous congestion.

Current occupancy data:
${Object.entries(sections).map(([name, pct]) => `- ${name}: ${pct}%`).join('\n')}

Rules:
- Only include sections with occupancy ≥ 75% in suggestions
- Suggest redirect to sections with occupancy ≤ 60%
- Urgency is "high" if ≥ 90%, "medium" if 75-89%, "low" otherwise
- Be specific about which gate and why

Respond ONLY with valid JSON (no markdown blocks) using this exact schema:
{
  "suggestions": [
    {
      "fromSection": "section name",
      "toGate": "Gate X (Section Name — XX% full)",
      "reason": "actionable reason in 1-2 sentences",
      "urgency": "low|medium|high"
    }
  ],
  "summary": "2-3 sentence executive summary for stadium operations staff"
}`

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      // Strip any accidental markdown fences
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const parsed = JSON.parse(cleaned) as { suggestions: RoutingSuggestion[]; summary: string }

      const response: CrowdRoutingResponse = {
        suggestions: parsed.suggestions ?? [],
        summary: parsed.summary ?? 'No summary provided.',
        generatedAt: Date.now(),
      }

      return response

    } catch (err) {
      console.error('Gemini error:', err)
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate crowd routing suggestions. Please try again.'
      )
    }
  })
