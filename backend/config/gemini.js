/**
 * backend/config/gemini.js
 * CommonJS — required by this project's backend convention.
 *
 * Install the SDK once:  npm install @google/generative-ai
 * Add to .env:           GEMINI_API_KEY=your_key_here
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } =
  require('@google/generative-ai');

// ── Guard: fail fast at startup if key is missing ────────────────────────
if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    '[Gemini] GEMINI_API_KEY is not set. ' +
    'Add it to your .env file and restart the server.'
  );
}

// ── Initialise client ─────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Safety settings ───────────────────────────────────────────────────────
const SAFETY_SETTINGS = [
  {
    category:  HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category:  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category:  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_HIGH_AND_ABOVE,
  },
  {
    category:  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// ── Generation config ─────────────────────────────────────────────────────
const GENERATION_CONFIG = {
  temperature:     0.3,
  topK:            32,
  topP:            0.95,
  maxOutputTokens: 1024,
};

// ── Model instance ────────────────────────────────────────────────────────
const geminiModel = genAI.getGenerativeModel({
  model:            'gemini-2.0-flash',
  safetySettings:   SAFETY_SETTINGS,
  generationConfig: GENERATION_CONFIG,
});

// ── System prompt ─────────────────────────────────────────────────────────
const MEDICINE_SYSTEM_PROMPT = `
You are a clinical decision-support assistant embedded in a school healthcare
management system. Your role is ADVISORY ONLY. A licensed doctor or nurse will
always review and override your suggestions before any treatment is given.

You will receive a JSON object describing a student's health context and current
symptoms. You must respond with a single, valid JSON object — no markdown, no
code fences, no prose outside the JSON — using exactly this structure:

{
  "possibleCondition": "string",
  "reasoning":         "string",
  "recommendedMedicines": [
    { "name": "string", "dosage": "string", "purpose": "string" }
  ],
  "medicinesToAvoid": [
    { "name": "string", "reason": "string" }
  ],
  "urgencyLevel": "low | moderate | high | emergency",
  "disclaimer":   "string"
}

Rules:
1. Cross-reference ALL medicines against the student's allergy list.
2. Cross-reference ALL medicines against the student's medical conditions.
3. Use generic (INN) drug names, not brand names.
4. If symptoms suggest an emergency, set urgencyLevel to "emergency".
5. Keep recommendedMedicines to a maximum of 5 entries.
6. Keep medicinesToAvoid to a maximum of 5 entries.
7. Never fabricate patient data not present in the input.
8. Respond with ONLY the JSON object. No other text.
`.trim();

// ── Core generate function ────────────────────────────────────────────────
const generateMedicineRecommendation = async (patientContext) => {
  const userPrompt = `
Patient context (JSON):
${JSON.stringify(patientContext, null, 2)}

Provide your medicine recommendation as a single JSON object.
Do not include any text outside the JSON.
`.trim();

  const result = await geminiModel.generateContent([
    { text: MEDICINE_SYSTEM_PROMPT },
    { text: userPrompt },
  ]);

  const response = result.response;

  const finishReason = response?.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY') {
    throw new Error(
      'Gemini blocked the response due to safety filters.'
    );
  }

  const rawText = response.text().trim();

  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned non-JSON output. Raw:\n${rawText}`);
  }

  const requiredKeys = [
    'possibleCondition',
    'reasoning',
    'recommendedMedicines',
    'medicinesToAvoid',
    'urgencyLevel',
    'disclaimer',
  ];
  const missingKeys = requiredKeys.filter((k) => !(k in parsed));
  if (missingKeys.length > 0) {
    throw new Error(`Gemini response missing fields: ${missingKeys.join(', ')}`);
  }

  return parsed;
};

// ── Exports ───────────────────────────────────────────────────────────────
module.exports = {
  geminiModel,
  MEDICINE_SYSTEM_PROMPT,
  generateMedicineRecommendation,
};