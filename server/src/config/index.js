// Central configuration — edit parts/columns here

require("dotenv").config({ path: require("path").join(__dirname, "../../.env"), override: true });

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
    apiToken: (process.env.AIRTABLE_API_TOKEN || "").trim(),
    baseId: (process.env.AIRTABLE_BASE_ID || "").trim(),
  },

  // ── Google OAuth ──
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },

  // ── Storage ──
  uploadDir: process.env.UPLOAD_DIR || "./uploads",

  // ── Admin ──
  adminEmails: (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean),

  // ── DynamoDB ──
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE || "formerly-users",
    region: process.env.AWS_REGION || "us-east-1",
  },

  // ── Parts (clubs/teams) ──
  // Maps partId → Airtable table name
  parts: {
    "aws-cloud-club": { id: "aws-cloud-club", name: "AWS Cloud Club", tableName: "AWS Cloud Club" },
    "bruin-ai": { id: "bruin-ai", name: "Bruin AI", tableName: "Bruin AI" },
    "ieee": { id: "ieee", name: "IEEE", tableName: "IEEE" },
  },
};

module.exports = config;
