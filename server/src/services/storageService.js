/**
 * Storage Service
 *
 * MVP: In-memory store for receipt metadata + local disk for images.
 * Replace with DynamoDB/S3 when scaling.
 */

const { v4: uuidv4 } = require("uuid");

// In-memory receipt store: receiptId → metadata
const receipts = new Map();

/**
 * Create a new receipt record
 * @param {string} filePath - Path to the uploaded image
 * @param {string} originalName - Original filename
 * @returns {object} The created receipt record
 */
function createReceipt(filePath, originalName) {
  const id = uuidv4();
  const receipt = {
    id,
    filePath,
    originalName,
    status: "uploaded", // uploaded → extracted → submitted
    extractedData: null,
    partId: null,
    createdAt: new Date().toISOString(),
    extractedAt: null,
    submittedAt: null,
    error: null,
  };

  receipts.set(id, receipt);
  console.log(`[Storage] Created receipt ${id} from "${originalName}"`);
  return receipt;
}

/**
 * Get a receipt by ID
 */
function getReceipt(id) {
  return receipts.get(id) || null;
}

/**
 * Update a receipt's extracted data
 */
function setExtractedData(id, data) {
  const receipt = receipts.get(id);
  if (!receipt) throw new Error(`Receipt not found: ${id}`);

  receipt.extractedData = data;
  receipt.status = "extracted";
  receipt.extractedAt = new Date().toISOString();
  receipt.error = null;

  return receipt;
}

/**
 * Mark a receipt as submitted
 */
function markSubmitted(id, partId) {
  const receipt = receipts.get(id);
  if (!receipt) throw new Error(`Receipt not found: ${id}`);

  receipt.status = "submitted";
  receipt.partId = partId;
  receipt.submittedAt = new Date().toISOString();

  return receipt;
}

/**
 * Mark a receipt as errored
 */
function setError(id, errorMessage) {
  const receipt = receipts.get(id);
  if (!receipt) return;

  receipt.error = errorMessage;
  return receipt;
}

module.exports = {
  createReceipt,
  getReceipt,
  setExtractedData,
  markSubmitted,
  setError,
};
