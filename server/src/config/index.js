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

  // ── Airtable ──
  airtable: {
    apiToken: process.env.AIRTABLE_API_TOKEN,
    baseId: process.env.AIRTABLE_BASE_ID,
  },

  // ── Storage ──
  uploadDir: process.env.UPLOAD_DIR || "./uploads",

  // ── Parts (clubs/teams) ──
  // Maps partId → Airtable table name
  parts: {
    build: { id: "build", name: "Build", tableName: "Build" },
    programming: { id: "programming", name: "Programming", tableName: "Programming" },
    outreach: { id: "outreach", name: "Outreach", tableName: "Outreach" },
  },
};

module.exports = config;
