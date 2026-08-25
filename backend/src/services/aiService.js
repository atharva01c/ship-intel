const axios = require("axios");
const crypto = require("crypto");
const { z } = require("zod");

const ShipmentSchema = z.object({
  shipment_weight: z.number().nullable(),
  delivery_days: z.number().nullable(),
  origin: z.string().nullable(),
  destination: z.string().nullable(),
  product_type: z.string().nullable(),
  special_requirements: z.array(z.string()),
  recommendations: z.array(z.string()),

  // AI self-reported extraction confidence
  confidence: z.number().min(0).max(100),
  confidence_reasons: z.array(z.string()),
});

const getNvidiaClient = () =>
  axios.create({
    baseURL: "https://integrate.api.nvidia.com/v1",
    timeout: 30_000,
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

const SYSTEM_PROMPT = `
You are a logistics shipment intelligence assistant.

Analyze the shipment description and extract relevant logistics information.

Return ONLY valid JSON.

Your response must start with "{" and end with "}".
Do not write any reasoning, explanations, or text outside the JSON.

Return exactly these fields:

{
  "shipment_weight": number or null,
  "delivery_days": number or null,
  "origin": string or null,
  "destination": string or null,
  "product_type": string or null,
  "special_requirements": array of strings,
  "recommendations": array of strings,
  "confidence": number from 0 to 100,
  "confidence_reasons": array of strings
}

Rules:
1. Extract only explicitly stated or clearly implied information.
2. Use null when unavailable.
3. Never invent shipment information.
4. Do not duplicate delivery deadlines inside special_requirements.
5. special_requirements should contain cargo-specific requirements.
6. recommendations should be practical logistics actions.
7. Return 2 to 5 recommendations when sufficient information exists.
8. confidence reflects how confident you are that the extraction is
   accurate AND complete given the input text: 100 means every field is
   explicitly stated, lower values mean missing or ambiguous details.
9. confidence_reasons must briefly list what made extraction uncertain
   (e.g. "weight not explicitly stated", "destination ambiguous").
   Return an empty array when you are fully confident.
`;

const validateDescription = (description) => {
  if (typeof description !== "string") {
    throw new Error("Description must be a string");
  }

  const value = description.trim();

  if (!value) {
    throw new Error("Description cannot be empty");
  }

  if (value.length > 10_000) {
    throw new Error("Description is too long");
  }

  return value;
};

// Bound the conversation history sent to the model so long chats don't
// blow past the context window.
const MAX_HISTORY_MESSAGES = 20;

// Cap follow-up answers; they should be concise. Budget is generous
// because reasoning models spend tokens thinking before answering.
const QUESTION_MAX_TOKENS = 1200;

const answerShipmentQuestion = async ({ question, history, shipmentContext }) => {
  const requestId = crypto.randomUUID();

  const input = validateDescription(question);

  const SYSTEM_PROMPT = `
You are a logistics assistant answering questions about ONE specific shipment.

Here is everything you know about this shipment (retrieved from the database):

${shipmentContext}

Rules:
1. Answer ONLY using the shipment data above and the conversation history. Never fabricate information that is not present there.
2. If the answer is not contained in the data, say you don't have that information — do not guess.
3. For hypothetical questions (e.g. "what if I reduce the weight?"), reason qualitatively over the given data and clearly state it would be an estimate; never claim the stored shipment has changed.
4. Keep answers short and concrete.
5. If a field in the data is null or empty, treat it as unknown rather than inventing a value.
`;

  try {
    const response = await getNvidiaClient().post("/chat/completions", {
      model: process.env.NVIDIA_MODEL,

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },

        ...history.map((message) => ({
          role: message.role,
          content: message.content,
        })),

        {
          role: "user",
          content: input,
        },
      ],

      temperature: 0.2,
      max_tokens: QUESTION_MAX_TOKENS,
    });

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error("Empty AI response");
    }

    return content.trim();
  } catch (error) {
    console.error({
      requestId,
      provider: "nvidia",
      status: error.response?.status,
      error: error.message,
    });

    throw new Error("AI service failed");
  }
};

// Reasoning-style models emit chain-of-thought before the JSON payload,
// so the budget must cover thinking plus the full extraction.
const ANALYSIS_MAX_TOKENS = 2000;

const extractJsonPayload = (content) => {
  // Some models wrap JSON in markdown fences or precede it with prose.
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response contains no JSON object");
  }

  return cleaned.slice(start, end + 1);
};

const analyzeShipment = async (description) => {
  const requestId = crypto.randomUUID();

  const input = validateDescription(description);

  try {
    const response = await getNvidiaClient().post("/chat/completions", {
      model: process.env.NVIDIA_MODEL,

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: input,
        },
      ],

      temperature: 0.2,
      max_tokens: ANALYSIS_MAX_TOKENS,
    });

    const choice = response.data?.choices?.[0];
    const content = choice?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    if (choice.finish_reason === "length") {
      throw new Error("AI response truncated before completion");
    }

    let parsed;

    try {
      parsed = JSON.parse(extractJsonPayload(content));
    } catch (parseError) {
      if (
        parseError instanceof Error &&
        parseError.message.startsWith("AI response")
      ) {
        throw parseError;
      }

      throw new Error("AI returned invalid JSON");
    }

    const result = ShipmentSchema.safeParse(parsed);

    if (!result.success) {
      console.error({
        requestId,
        error: "Invalid AI response schema",
      });

      throw new Error("AI returned invalid shipment data");
    }

    return result.data;
  } catch (error) {
    console.error({
      requestId,
      provider: "nvidia",
      status: error.response?.status,
      error: error.message,
    });

    throw new Error("AI service failed");
  }
};

module.exports = {
  analyzeShipment,
  answerShipmentQuestion,
};