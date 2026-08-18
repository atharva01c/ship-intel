const axios = require("axios");

const analyzeShipment = async (description) => {
  try {
    const response = await axios.post(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        model: process.env.NVIDIA_MODEL,

        messages: [
          {
            role: "system",
            content: `
You are a logistics shipment intelligence assistant.

Analyze the shipment description and extract relevant logistics information.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside the JSON.

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

1. Extract only information explicitly stated or reasonably implied by the shipment description.
2. Use null when information is unavailable.
3. Do not invent shipment information.
4. Do not duplicate delivery deadlines inside special_requirements.
5. special_requirements should only contain cargo-specific requirements such as temperature control, fragile handling, hazardous material handling, special packaging, etc.
6. recommendations should contain practical logistics actions based on the shipment.
7. Recommendations can consider delivery deadlines, shipment weight, cargo type, origin, destination, special requirements, customs, documentation, handling, and transportation planning.
8. Return 2 to 5 useful recommendations when enough information is available.
9. Do not provide recommendations unrelated to the shipment.
`,
          },
          {
            role: "user",
            content: description,
          },
        ],

        temperature: 0.2,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content = response.data.choices[0].message.content;

    const parsedResult = JSON.parse(content);

    return parsedResult;
  } catch (error) {
    console.error("NVIDIA NIM error:", error.response?.data || error.message);

    throw new Error("AI service failed");
  }
};

module.exports = {
  analyzeShipment,
};
