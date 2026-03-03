/**
 * Nova AI Receipt Extraction Service
 *
 * Sends a receipt image to Amazon Nova via Bedrock and returns
 * structured JSON with merchant, date, total, tax, etc.
 */

const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const fs = require("fs");
const path = require("path");
const config = require("../config");

// ── Bedrock Client ──
const bedrockClient = new BedrockRuntimeClient({
  region: config.aws.region,
});

// ── Extraction Prompt ──
const EXTRACTION_PROMPT = `You are a receipt-reading AI. Analyze the receipt image and extract the following fields.
Return ONLY valid JSON — no markdown, no explanation, no backticks.

Required JSON schema:
{
  "merchant": string or null,
  "date": "YYYY-MM-DD" or null,
  "total": number or null,
  "tax": number or null,
  "currency": "USD" (3-letter uppercase) or null,
  "payment_method": "cash" | "credit" | "debit" | "other" or null,
  "confidence": {
    "merchant": 0.0 to 1.0,
    "date": 0.0 to 1.0,
    "total": 0.0 to 1.0,
    "tax": 0.0 to 1.0
  }
}

Rules:
- total and tax must be numbers (no $ signs)
- date must be YYYY-MM-DD format
- currency must be 3-letter uppercase (e.g., USD, EUR, CAD)
- confidence is your certainty for each field (1.0 = very sure, 0.0 = guessing)
- If you cannot read a field, set it to null with confidence 0.0
- Return ONLY the JSON object, nothing else`;

/**
 * Extract receipt data from an image file using Amazon Nova
 * @param {string} imagePath - Absolute path to the receipt image
 * @returns {Promise<object>} Extracted receipt data
 */
async function extractReceipt(imagePath) {
  // Read the image and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  // Determine media type from extension
  const ext = path.extname(imagePath).toLowerCase();
  const mediaTypeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  const mediaType = mediaTypeMap[ext] || "image/jpeg";

  // ── Build the Nova request payload ──
  // Amazon Nova uses the Bedrock Messages API format
  const payload = {
    messages: [
      {
        role: "user",
        content: [
          {
            image: {
              format: ext.replace(".", ""), // "jpeg", "png", etc.
              source: {
                bytes: base64Image,
              },
            },
          },
          {
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
    inferenceConfig: {
      maxNewTokens: 1024,
      temperature: 0.1, // Low temp for consistent structured output
      topP: 0.9,
    },
  };

  // ── Call Bedrock ──
  const command = new InvokeModelCommand({
    modelId: config.aws.modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  // ── Parse Nova's response ──
  // Nova returns { output: { message: { content: [{ text: "..." }] } } }
  const rawText =
    responseBody.output?.message?.content?.[0]?.text ||
    responseBody.content?.[0]?.text ||
    "";

  // Strip any accidental markdown fences
  const cleanJson = rawText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let extracted;
  try {
    extracted = JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("Nova returned invalid JSON:", rawText);
    throw new Error("Failed to parse Nova response as JSON");
  }

  // ── Validate & normalize ──
  return normalizeExtraction(extracted);
}

/**
 * Normalize and validate extracted data
 */
function normalizeExtraction(data) {
  const result = {
    merchant: typeof data.merchant === "string" ? data.merchant.trim() : null,
    date: null,
    total: null,
    tax: null,
    currency: null,
    payment_method: null,
    confidence: {
      merchant: 0,
      date: 0,
      total: 0,
      tax: 0,
    },
  };

  // Date: validate YYYY-MM-DD format
  if (data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    const parsed = new Date(data.date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (!isNaN(parsed.getTime()) && parsed <= weekFromNow) {
      result.date = data.date;
    }
  }

  // Total: must be a positive number
  if (typeof data.total === "number" && data.total > 0) {
    result.total = Math.round(data.total * 100) / 100;
  }

  // Tax: must be >= 0 and <= total
  if (typeof data.tax === "number" && data.tax >= 0) {
    result.tax = Math.round(data.tax * 100) / 100;
    // Sanity check: tax shouldn't exceed total
    if (result.total !== null && result.tax > result.total) {
      result.tax = null;
      if (data.confidence) data.confidence.tax = 0.2;
    }
  }

  // Currency: 3-letter uppercase
  if (typeof data.currency === "string" && /^[A-Z]{3}$/.test(data.currency.toUpperCase())) {
    result.currency = data.currency.toUpperCase();
  }

  // Payment method
  const validMethods = ["cash", "credit", "debit", "other"];
  if (typeof data.payment_method === "string" && validMethods.includes(data.payment_method.toLowerCase())) {
    result.payment_method = data.payment_method.toLowerCase();
  }

  // Confidence scores: clamp 0–1
  if (data.confidence && typeof data.confidence === "object") {
    for (const field of ["merchant", "date", "total", "tax"]) {
      const val = data.confidence[field];
      if (typeof val === "number") {
        result.confidence[field] = Math.max(0, Math.min(1, val));
      }
    }
  }

  // Lower confidence for null fields
  if (result.date === null) result.confidence.date = 0;
  if (result.total === null) result.confidence.total = 0;

  return result;
}

module.exports = { extractReceipt };
