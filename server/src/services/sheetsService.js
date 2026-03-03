/**
 * Google Sheets Service
 *
 * Append-only writes to the target spreadsheet.
 * Each "part" (club/team) maps to a separate tab.
 */

const { google } = require("googleapis");
const path = require("path");
const config = require("../config");

let sheetsClient = null;

/**
 * Initialize the Google Sheets client with service account credentials
 */
async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const credPath = path.resolve(config.sheets.credentialsPath);

  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  sheetsClient = google.sheets({ version: "v4", auth: authClient });

  return sheetsClient;
}

/**
 * Append a receipt row to the correct sheet tab
 *
 * @param {string} partId - The part/club ID (e.g., "build")
 * @param {object} receiptData - Extracted + edited receipt fields
 * @param {string} receiptId - Unique receipt identifier
 * @param {string} status - "auto" or "edited"
 * @returns {Promise<object>} Google Sheets API response
 */
async function appendReceiptRow(partId, receiptData, receiptId, status = "auto", userName = "") {
  const sheets = await getSheetsClient();

  // Look up the sheet tab name for this part
  const part = config.parts[partId];
  if (!part) {
    throw new Error(`Unknown part: ${partId}`);
  }

  const tabName = part.sheetTab;

  // Build the row matching config.sheetColumns order:
  // Timestamp, SubmittedBy, Part, Merchant, Date, Total, Tax, Currency, PaymentMethod, ReceiptID, Notes, Status
  const row = [
    new Date().toISOString(),                          // Timestamp
    userName || "",                                     // SubmittedBy
    part.name,                                          // Part
    receiptData.merchant || "",                         // Merchant
    receiptData.date || "",                             // Date
    receiptData.total != null ? receiptData.total : "", // Total
    receiptData.tax != null ? receiptData.tax : "",     // Tax
    receiptData.currency || "",                         // Currency
    receiptData.payment_method || "",                   // PaymentMethod
    receiptId,                                          // ReceiptID
    receiptData.notes || "",                            // Notes
    status,                                             // Status (auto/edited)
  ];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: config.sheets.spreadsheetId,
    range: `${tabName}!A:L`, // Columns A through L
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });

  console.log(`[Sheets] Appended row to tab "${tabName}" for receipt ${receiptId}`);
  return response.data;
}

/**
 * Ensure header row exists in a sheet tab
 * Call this once during setup or app start
 */
async function ensureHeaders(partId) {
  const sheets = await getSheetsClient();
  const part = config.parts[partId];
  if (!part) return;

  const tabName = part.sheetTab;

  // Check if row 1 already has headers
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheets.spreadsheetId,
      range: `${tabName}!A1:L1`,
    });

    if (existing.data.values && existing.data.values.length > 0) {
      return; // Headers already exist
    }
  } catch (err) {
    // Tab might not exist yet — that's okay, the append will fail clearly
    console.warn(`[Sheets] Could not check headers for tab "${tabName}":`, err.message);
    return;
  }

  // Write header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.sheets.spreadsheetId,
    range: `${tabName}!A1:L1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [config.sheetColumns],
    },
  });

  console.log(`[Sheets] Wrote headers to tab "${tabName}"`);
}

module.exports = { appendReceiptRow, ensureHeaders };
