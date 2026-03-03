// Central configuration — edit parts/columns here

require("dotenv").config();

const config = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || "development",

  // ── AWS Bedrock ──
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    modelId: process.env.NOVA_MODEL_ID || "amazon.nova-lite-v1:0",
  },

  // ── Google Sheets ──
  sheets: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || "./src/config/google-credentials.json",
  },

  // ── Storage ──
  uploadDir: process.env.UPLOAD_DIR || "./uploads",

  // ── Parts (clubs/teams) ──
  // Maps partId → Google Sheet tab name
  parts: {
    build: { id: "build", name: "Build", sheetTab: "Build" },
    programming: { id: "programming", name: "Programming", sheetTab: "Programming" },
    outreach: { id: "outreach", name: "Outreach", sheetTab: "Outreach" },
  },

  // ── Sheet columns (order matters — this is the column order in each tab) ──
  sheetColumns: [
    "Timestamp",
    "SubmittedBy",
    "Part",
    "Merchant",
    "Date",
    "Total",
    "Tax",
    "Currency",
    "PaymentMethod",
    "ReceiptID",
    "Notes",
    "Status",
  ],
};

module.exports = config;
