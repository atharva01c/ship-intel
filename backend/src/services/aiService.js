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

Return exactly these fields:

{
  "shipment_weight": number or null,
  "delivery_days": number or null,
  "origin": string or null,
  "destination": string or null,
  "product_type": string or null,
  "special_requirements": array of strings,
  "recommendations": array of strings
}

Rules:
1. Extract only explicitly stated or clearly implied information.
2. Use null when unavailable.
3. Never invent shipment information.
4. Do not duplicate delivery deadlines inside special_requirements.
5. special_requirements should contain cargo-specific requirements.
6. recommendations should be practical logistics actions.
7. Return 2 to 5 recommendations when sufficient information exists.
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
      max_tokens: 700,
    });

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    let parsed;

    try {
      // Strip markdown code fences that some models wrap around JSON
      const cleaned = content
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
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
};