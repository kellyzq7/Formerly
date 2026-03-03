/**
 * Nova AI Receipt Extraction Service
 *
 * Sends a receipt image to Amazon Nova Lite via Bedrock's Converse API
 * and returns structured JSON with merchant, date, total, tax, etc.
 *
 * Uses the Converse API (recommended by AWS for Nova multimodal input).
 * Docs: https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html
 */

const {
  BedrockRuntimeClient,
  ConverseCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const fs = require("fs");
const path = require("path");
const config = require("../config");

// ── Bedrock Client ──
const bedrockClient = new BedrockRuntimeClient({
  region: config.aws.region,
});

// ── System Prompt ──
const SYSTEM_PROMPT = `You are a receipt-reading AI. You will be given an image of a receipt.
Extract the requested fields and return ONLY valid JSON — no markdown, no explanation, no backticks, no extra text.`;

// ── User Prompt ──
const USER_PROMPT = `Analyze this receipt image and extract the following fields.
Return ONLY a valid JSON object matching this exact schema:

{
  "merchant": "store name as string, or null if unreadable",
  "date": "YYYY-MM-DD format, or null if unreadable",
  "total": 0.00,
  "tax": 0.00,
  "currency": "USD",
  "payment_method": "cash or credit or debit or other, or null",
  "confidence": {
    "merchant": 0.0,
    "date": 0.0,
    "total": 0.0,
    "tax": 0.0
  }
}

Rules:
- total and tax must be numbers (no $ signs). total is the final amount paid.
- date must be YYYY-MM-DD format
- currency must be 3-letter uppercase (e.g., USD, EUR, CAD)
- confidence is your certainty for each field (1.0 = very sure, 0.0 = guessing)
- If you cannot read a field, set it to null with confidence 0.0
- Return ONLY the JSON object, nothing else`;

/**
 * Extract receipt data from an image file using Amazon Nova via Converse API
 * @param {string} imagePath - Absolute path to the receipt image
 * @returns {Promise<object>} Extracted receipt data
 */
async function extractReceipt(imagePath) {
  // Read the image as raw bytes (Converse API accepts Uint8Array directly)
  const imageBytes = fs.readFileSync(imagePath);

  // Determine image format from extension
  const ext = path.extname(imagePath).toLowerCase().replace(".", "");
  const formatMap = {
    jpg: "jpeg",
    jpeg: "jpeg",
    png: "png",
    gif: "gif",
    webp: "webp",
  };
  const format = formatMap[ext] || "jpeg";

  // ── Build the Converse API request ──
  const command = new ConverseCommand({
    modelId: config.aws.modelId, // "amazon.nova-lite-v1:0"
    system: [{ text: SYSTEM_PROMPT }],
    messages: [
      {
        role: "user",
        content: [
          {
            image: {
              format: format,
              source: {
                bytes: imageBytes, // Converse API accepts raw bytes (Uint8Array)
              },
            },
          },
          {
            text: USER_PROMPT,
          },
        ],
      },
    ],
    inferenceConfig: {
      maxTokens: 1024,
      temperature: 0.1, // Low temp for consistent structured output
      topP: 0.9,
    },
  });

  // ── Call Bedrock ──
  console.log(`[Nova] Sending image to ${config.aws.modelId} via Converse API...`);
  const response = await bedrockClient.send(command);

  // ── Parse the Converse API response ──
  // Response structure: { output: { message: { role, content: [{ text }] } }, stopReason, usage }
  const rawText = response.output?.message?.content?.[0]?.text || "";

  console.log(`[Nova] Raw response (${response.stopReason}):`, rawText.substring(0, 200));
  console.log(`[Nova] Tokens — input: ${response.usage?.inputTokens}, output: ${response.usage?.outputTokens}`);

  // Strip any accidental markdown fences
  const cleanJson = rawText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let extracted;
  try {
    extracted = JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("[Nova] Returned invalid JSON:", rawText);
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
