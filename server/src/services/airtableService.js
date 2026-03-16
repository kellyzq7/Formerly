/**
 * Airtable Service
 *
 * Appends receipt records to Airtable via their REST API.
 * Each "part" (club/team) maps to a separate table in the base.
 *
 * No SDK required — just fetch with a Bearer token.
 * Docs: https://airtable.com/developers/web/api/create-records
 */

const config = require("../config");

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

/**
 * Append a receipt record to the correct Airtable table
 *
 * @param {string} partId - The part/club ID (e.g., "build")
 * @param {object} receiptData - Extracted + edited receipt fields
 * @param {string} receiptId - Unique receipt identifier
 * @param {string} status - "auto" or "edited"
 * @param {string} userName - Name of the submitting user
 * @returns {Promise<object>} Airtable API response
 */
async function appendReceiptRow(partId, receiptData, receiptId, status = "auto", userName = "") {
  const part = config.parts[partId];
  if (!part) {
    throw new Error(`Unknown part: ${partId}`);
  }

  if (!config.airtable.apiToken || !config.airtable.baseId) {
    throw new Error("Airtable credentials not configured. Set AIRTABLE_API_TOKEN and AIRTABLE_BASE_ID in .env");
  }

  const tableName = encodeURIComponent(part.tableName);
  const url = `${AIRTABLE_API_URL}/${config.airtable.baseId}/${tableName}`;

  // Build the record fields — these must match your Airtable column names exactly
  const fields = {
    Timestamp: new Date().toISOString(),
    SubmittedBy: userName || "",
    Part: part.name,
    Merchant: receiptData.merchant || "",
    Date: receiptData.date || "",
    Total: receiptData.total != null ? Number(receiptData.total) : 0,
    Tax: receiptData.tax != null ? Number(receiptData.tax) : 0,
    Currency: receiptData.currency || "USD",
    PaymentMethod: receiptData.payment_method || "",
    ReceiptID: receiptId,
    Notes: receiptData.notes || "",
    Status: status,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.airtable.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [{ fields }],
      typecast: true, // Auto-create select options if they don't exist
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Airtable] Error ${response.status}:`, errorBody);
    throw new Error(`Airtable API error: ${response.status} — ${errorBody}`);
  }

  const data = await response.json();
  console.log(`[Airtable] Created record in "${part.tableName}" for receipt ${receiptId}`);
  return data;
}

/**
 * Fetch all receipt records for a club from Airtable, sorted newest first.
 *
 * @param {string} partId - Club ID
 * @returns {Promise<Array<{ id: string, fields: object }>>}
 */
async function getClubReceipts(partId) {
  const part = config.parts[partId];
  if (!part) throw new Error(`Unknown part: ${partId}`);

  if (!config.airtable.apiToken || !config.airtable.baseId) {
    throw new Error("Airtable credentials not configured");
  }

  const tableName = encodeURIComponent(part.tableName);
  const url = `${AIRTABLE_API_URL}/${config.airtable.baseId}/${tableName}?sort%5B0%5D%5Bfield%5D=Timestamp&sort%5B0%5D%5Bdirection%5D=desc`;

  console.log(`[Airtable] GET ${url}`);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.airtable.apiToken}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Airtable] GET ${response.status}:`, errorBody);
    throw new Error(`Airtable API error: ${response.status} — ${errorBody}`);
  }

  const data = await response.json();
  return data.records || [];
}

/**
 * Delete a specific record from a club's Airtable table.
 *
 * @param {string} partId - Club ID
 * @param {string} recordId - Airtable record ID (starts with "rec")
 */
async function deleteClubRecord(partId, recordId) {
  const part = config.parts[partId];
  if (!part) throw new Error(`Unknown part: ${partId}`);

  if (!config.airtable.apiToken || !config.airtable.baseId) {
    throw new Error("Airtable credentials not configured");
  }

  const tableName = encodeURIComponent(part.tableName);
  const url = `${AIRTABLE_API_URL}/${config.airtable.baseId}/${tableName}/${recordId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.airtable.apiToken}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Airtable API error: ${response.status} — ${errorBody}`);
  }

  console.log(`[Airtable] Deleted record ${recordId} from "${part.tableName}"`);
  return await response.json();
}

module.exports = { appendReceiptRow, getClubReceipts, deleteClubRecord };
