"use strict";

const OpenAI = require("openai");

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error(
    "OPENROUTER_API_KEY is not set. Add it to your .env file."
  );
}

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "deepseek/deepseek-chat";

const SYSTEM_PROMPT = `
You are a clinical decision-support assistant embedded in a school healthcare management system.

Your role is ADVISORY ONLY.

You will receive patient information and symptoms.

Return ONLY valid JSON in this format:

{
  "possibleCondition": "string",
  "reasoning": "string",
  "recommendedMedicines": [
    {
      "name": "string",
      "dosage": "string",
      "purpose": "string"
    }
  ],
  "medicinesToAvoid": [
    {
      "name": "string",
      "reason": "string"
    }
  ],
  "urgencyLevel": "low | moderate | high | emergency",
  "disclaimer": "string"
}

Rules:
1. Check allergies.
2. Check medical conditions.
3. Use generic medicine names only.
4. Maximum 5 recommended medicines.
5. Maximum 5 medicines to avoid.
6. Never output markdown.
7. Return JSON only.
`.trim();

async function generateMedicineRecommendation(patientContext) {
  const userPrompt = `
Patient context:
${JSON.stringify(patientContext, null, 2)}

Return only JSON.
`;

  const completion = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 1000,
  });

  const rawText =
    completion?.choices?.[0]?.message?.content?.trim();

  if (!rawText) {
    throw new Error("Empty response from OpenRouter");
  }

  

  const cleaned = rawText
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
   const parsed = JSON.parse(cleaned);

if (!parsed.possibleCondition) {
  throw new Error("Invalid AI response format");
}

return parsed;
  } catch (err) {
    throw new Error(
      `DeepSeek returned invalid JSON:\n${rawText}`
    );
  }
}

module.exports = {
  generateMedicineRecommendation,
};