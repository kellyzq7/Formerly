/**
 * Receipt API Routes
 *
 * POST /api/receipts              → Upload receipt image
 * POST /api/receipts/:id/extract  → Run Nova extraction
 * GET  /api/receipts/:id          → Get receipt status + data
 * POST /api/receipts/:id/submit   → Submit to Google Sheets
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const config = require("../config");
const { extractReceipt } = require("../services/novaService");
const { appendReceiptRow } = require("../services/sheetsService");
const storage = require("../services/storageService");

const router = express.Router();

// ── Multer config for image uploads ──
const upload = multer({
  dest: config.uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/receipts — Upload receipt image
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/", upload.single("receipt"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const receipt = storage.createReceipt(req.file.path, req.file.originalname);

    res.status(201).json({
      receiptId: receipt.id,
      status: receipt.status,
      message: "Receipt uploaded successfully",
    });
  } catch (err) {
    console.error("[Upload] Error:", err);
    res.status(500).json({ error: "Failed to upload receipt" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/receipts/:id/extract — Run Nova AI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/:id/extract", async (req, res) => {
  const { id } = req.params;

  try {
    const receipt = storage.getReceipt(id);
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    console.log(`[Extract] Starting extraction for receipt ${id}`);

    // Call Nova AI
    const extracted = await extractReceipt(receipt.filePath);

    // Save extracted data
    storage.setExtractedData(id, extracted);

    console.log(`[Extract] Completed for receipt ${id}`, extracted);

    res.json({
      receiptId: id,
      status: "extracted",
      data: extracted,
    });
  } catch (err) {
    console.error(`[Extract] Error for receipt ${id}:`, err);
    storage.setError(id, err.message);

    res.status(500).json({
      error: "Extraction failed",
      message: err.message,
      receiptId: id,
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/receipts/:id — Get receipt status/data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/:id", (req, res) => {
  const receipt = storage.getReceipt(req.params.id);

  if (!receipt) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  res.json({
    receiptId: receipt.id,
    status: receipt.status,
    data: receipt.extractedData,
    partId: receipt.partId,
    error: receipt.error,
    timestamps: {
      created: receipt.createdAt,
      extracted: receipt.extractedAt,
      submitted: receipt.submittedAt,
    },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/receipts/:id/submit — Submit to Sheets
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { partId, data, notes, userName } = req.body;

  try {
    // Validate part
    if (!partId || !config.parts[partId]) {
      return res.status(400).json({
        error: "Invalid part",
        validParts: Object.keys(config.parts),
      });
    }

    const receipt = storage.getReceipt(id);
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    // Use edited data from frontend, falling back to extracted data
    const finalData = data || receipt.extractedData;
    if (!finalData) {
      return res.status(400).json({ error: "No receipt data to submit" });
    }

    // Add notes if provided
    if (notes) finalData.notes = notes;

    // Determine if user edited the data
    const status = data ? "edited" : "auto";

    // Append to Google Sheets
    await appendReceiptRow(partId, finalData, id, status, userName);

    // Update receipt status
    storage.markSubmitted(id, partId);

    console.log(`[Submit] Receipt ${id} submitted to "${partId}" sheet`);

    res.json({
      receiptId: id,
      status: "submitted",
      part: config.parts[partId].name,
      message: "Receipt submitted to Google Sheets",
    });
  } catch (err) {
    console.error(`[Submit] Error for receipt ${id}:`, err);
    res.status(500).json({
      error: "Failed to submit to Google Sheets",
      message: err.message,
    });
  }
});

module.exports = router;
