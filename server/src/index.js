/**
 * Nova Receipt Reimbursement App — Server Entry Point
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env"), override: true });
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const config = require("./config");

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──
app.use("/api/users", require("./routes/users"));
app.use("/api/receipts", require("./routes/receipts"));
app.use("/api/parts", require("./routes/parts"));
app.use("/api/admin", require("./routes/admin"));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: config.env,
  });
});

// ── Error handling ──
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large. Max 10MB." });
  }

  res.status(500).json({
    error: "Internal server error",
    message: config.env === "development" ? err.message : undefined,
  });
});

// ── Start ──
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  Formerly — Server                      ║
  ║  http://localhost:${config.port}                ║
  ║  Environment: ${config.env.padEnd(26)}║
  ╚══════════════════════════════════════════╝
  `);

  // Validate config on startup
  if (!config.google.clientId) {
    console.warn("⚠️  GOOGLE_CLIENT_ID not set — Google sign-in will fail");
  }
  if (!config.airtable.apiToken || !config.airtable.baseId) {
    console.warn("⚠️  AIRTABLE credentials not set — submission will fail");
  } else {
    console.log(`[Airtable] baseId="${config.airtable.baseId}" (${config.airtable.baseId.length} chars)`);
  }
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
    console.warn("⚠️  AWS credentials not detected — Nova extraction will fail");
  }
});
