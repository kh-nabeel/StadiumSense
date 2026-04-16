"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrowdRoutingSuggestion = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const generative_ai_1 = require("@google/generative-ai");
// ─── Cloud Function ───────────────────────────────────────────────────────────
exports.getCrowdRoutingSuggestion = functions
    .runWith({ timeoutSeconds: 30, memory: '256MB' })
    .https.onCall(async (data, context) => {
    // Optional: require auth
    // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in')
    var _a, _b;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'GEMINI_API_KEY environment variable not set');
    }
    const { sections } = data;
    if (!sections || typeof sections !== 'object') {
        throw new functions.https.HttpsError('invalid-argument', 'sections must be an object mapping section names to occupancy percentages');
    }
    // Validate values
    for (const [name, pct] of Object.entries(sections)) {
        if (typeof pct !== 'number' || pct < 0 || pct > 100) {
            throw new functions.https.HttpsError('invalid-argument', `Invalid occupancy percentage for "${name}": must be 0-100`);
        }
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
}`;
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Strip any accidental markdown fences
        const cleaned = responseText
            .replace(/```json?\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        const parsed = JSON.parse(cleaned);
        const response = {
            suggestions: (_a = parsed.suggestions) !== null && _a !== void 0 ? _a : [],
            summary: (_b = parsed.summary) !== null && _b !== void 0 ? _b : 'No summary provided.',
            generatedAt: Date.now(),
        };
        return response;
    }
    catch (err) {
        console.error('Gemini error:', err);
        throw new functions.https.HttpsError('internal', 'Failed to generate crowd routing suggestions. Please try again.');
    }
});
//# sourceMappingURL=index.js.map