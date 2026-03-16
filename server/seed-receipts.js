/**
 * Seed script — clears existing records and inserts fresh fake receipts
 * with specific Item fields into each Airtable club table.
 * Run: node seed-receipts.js
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const API_TOKEN = process.env.AIRTABLE_API_TOKEN || "";
const API_URL = "https://api.airtable.com/v0";

function rid() {
  return "RCP-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ── Fake receipts per club — with specific Item fields ─────────────────────

const awsReceipts = [
  { Merchant: "Amazon Web Services", Item: "EC2 Compute Instance",       Date: "2025-10-05", Total: 134.72, Tax: 11.23, PaymentMethod: "Credit Card", Notes: "Demo project backend for workshop", Status: "auto",   SubmittedBy: "Arnav Praveen" },
  { Merchant: "Best Buy",            Item: "HDMI Cables & USB Hub",       Date: "2025-10-12", Total: 89.99,  Tax: 7.87,  PaymentMethod: "Debit Card",   Notes: "Workshop setup hardware",         Status: "edited", SubmittedBy: "Kelly Zhang" },
  { Merchant: "O'Reilly Learning",   Item: "Cloud Certification Course",  Date: "2025-10-20", Total: 49.00,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "AWS Solutions Architect prep",    Status: "auto",   SubmittedBy: "Arnav Praveen" },
  { Merchant: "Staples",             Item: "Printed Flyers",              Date: "2025-11-02", Total: 23.47,  Tax: 2.06,  PaymentMethod: "Debit Card",   Notes: "AWS re:Invent watch party",       Status: "auto",   SubmittedBy: "Marcus Lee" },
  { Merchant: "Amazon Web Services", Item: "S3 Storage & Lambda",        Date: "2025-11-15", Total: 208.10, Tax: 0,     PaymentMethod: "Credit Card", Notes: "Hackathon infrastructure",        Status: "edited", SubmittedBy: "Kelly Zhang" },
  { Merchant: "Eventbrite",          Item: "Conference Tickets",          Date: "2025-11-18", Total: 60.00,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "LA Cloud Computing Summit x3",   Status: "auto",   SubmittedBy: "Arnav Praveen" },
  { Merchant: "Target",              Item: "Snacks & Drinks",             Date: "2025-12-01", Total: 37.84,  Tax: 3.31,  PaymentMethod: "Cash",         Notes: "General meeting catering",        Status: "auto",   SubmittedBy: "Marcus Lee" },
  { Merchant: "Udemy",               Item: "Online Course License",       Date: "2025-12-10", Total: 29.99,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "Officer training course",         Status: "auto",   SubmittedBy: "Kelly Zhang" },
  { Merchant: "Whole Foods",         Item: "Catering Spread",             Date: "2026-01-08", Total: 54.22,  Tax: 4.14,  PaymentMethod: "Debit Card",   Notes: "Winter quarter kickoff",          Status: "edited", SubmittedBy: "Arnav Praveen" },
  { Merchant: "Zoom",                Item: "Video Conferencing Subscription", Date: "2026-01-15", Total: 14.99, Tax: 0, PaymentMethod: "Credit Card", Notes: "Monthly Zoom Pro",                Status: "auto",   SubmittedBy: "Marcus Lee" },
];

const bruinAiReceipts = [
  { Merchant: "Nvidia Developer Store", Item: "CUDA Deep Learning Toolkit", Date: "2025-10-08", Total: 299.00, Tax: 26.16, PaymentMethod: "Credit Card", Notes: "Model training toolkit",          Status: "edited", SubmittedBy: "Sophie Chen" },
  { Merchant: "Roboflow",              Item: "Dataset Annotation Platform", Date: "2025-10-14", Total: 49.00,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "Computer vision labeling tool",  Status: "auto",   SubmittedBy: "Rahul Gupta" },
  { Merchant: "Whole Foods",           Item: "Catering Spread",             Date: "2025-10-22", Total: 61.35,  Tax: 4.69,  PaymentMethod: "Debit Card",   Notes: "AI ethics panel discussion",     Status: "auto",   SubmittedBy: "Sophie Chen" },
  { Merchant: "Google Colab Pro",      Item: "GPU Compute Credits",         Date: "2025-11-05", Total: 9.99,   Tax: 0,     PaymentMethod: "Credit Card", Notes: "Model training sessions",        Status: "auto",   SubmittedBy: "Rahul Gupta" },
  { Merchant: "Coursera",              Item: "Online Course License",       Date: "2025-11-11", Total: 79.00,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "Deep learning specialization x4", Status: "edited", SubmittedBy: "Lena Park" },
  { Merchant: "Staples",               Item: "Printed Posters",             Date: "2025-11-20", Total: 18.92,  Tax: 1.65,  PaymentMethod: "Cash",         Notes: "AI showcase signage",            Status: "auto",   SubmittedBy: "Sophie Chen" },
  { Merchant: "Eventbrite",            Item: "Conference Tickets",          Date: "2025-11-28", Total: 120.00, Tax: 0,     PaymentMethod: "Credit Card", Notes: "NeurIPS watch party venue",      Status: "edited", SubmittedBy: "Rahul Gupta" },
  { Merchant: "Amazon",                Item: "Whiteboard Markers & Sticky Notes", Date: "2025-12-06", Total: 43.97, Tax: 3.84, PaymentMethod: "Credit Card", Notes: "Workshop supplies",           Status: "auto",   SubmittedBy: "Lena Park" },
  { Merchant: "HuggingFace",           Item: "Model Hosting Subscription", Date: "2026-01-10", Total: 20.00,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "Demo model hosting",            Status: "auto",   SubmittedBy: "Sophie Chen" },
  { Merchant: "Target",                Item: "Snacks & Drinks",             Date: "2026-01-20", Total: 47.56,  Tax: 4.16,  PaymentMethod: "Debit Card",   Notes: "Winter showcase",               Status: "auto",   SubmittedBy: "Rahul Gupta" },
];

const ieeeReceipts = [
  { Merchant: "Digi-Key Electronics", Item: "Resistors & Capacitors",    Date: "2025-10-03", Total: 112.45, Tax: 9.83,  PaymentMethod: "Credit Card", Notes: "PCB lab components",              Status: "edited", SubmittedBy: "Jason Torres" },
  { Merchant: "Adafruit",             Item: "Arduino Kit",               Date: "2025-10-10", Total: 78.20,  Tax: 6.84,  PaymentMethod: "Credit Card", Notes: "Introductory workshop kits",     Status: "auto",   SubmittedBy: "Priya Nair" },
  { Merchant: "Staples",              Item: "Printed Circuit Diagrams",  Date: "2025-10-18", Total: 31.14,  Tax: 2.72,  PaymentMethod: "Debit Card",   Notes: "Member handouts",                Status: "auto",   SubmittedBy: "Jason Torres" },
  { Merchant: "McMaster-Carr",        Item: "Bolts & Standoffs",         Date: "2025-11-01", Total: 55.00,  Tax: 4.81,  PaymentMethod: "Credit Card", Notes: "Project enclosure hardware",     Status: "edited", SubmittedBy: "Daniel Kim" },
  { Merchant: "Fry's Electronics",    Item: "Soldering Iron",            Date: "2025-11-09", Total: 144.99, Tax: 12.68, PaymentMethod: "Cash",         Notes: "New member soldering kits",      Status: "auto",   SubmittedBy: "Priya Nair" },
  { Merchant: "Eventbrite",           Item: "Conference Tickets",        Date: "2025-11-17", Total: 90.00,  Tax: 0,     PaymentMethod: "Credit Card", Notes: "IEEE SoCal student conf x3",     Status: "auto",   SubmittedBy: "Jason Torres" },
  { Merchant: "Whole Foods",          Item: "Catering Spread",           Date: "2025-11-25", Total: 68.43,  Tax: 5.22,  PaymentMethod: "Debit Card",   Notes: "Semester-end demo event",        Status: "edited", SubmittedBy: "Daniel Kim" },
  { Merchant: "Digi-Key Electronics", Item: "STM32 Microcontroller",     Date: "2025-12-08", Total: 89.60,  Tax: 7.84,  PaymentMethod: "Credit Card", Notes: "Robotics subteam build",         Status: "auto",   SubmittedBy: "Priya Nair" },
  { Merchant: "Amazon",               Item: "Extension Cords & Power Strips", Date: "2026-01-06", Total: 36.75, Tax: 3.21, PaymentMethod: "Debit Card", Notes: "Workshop room setup",           Status: "auto",   SubmittedBy: "Jason Torres" },
  { Merchant: "Target",               Item: "Snacks & Drinks",           Date: "2026-01-22", Total: 29.88,  Tax: 2.61,  PaymentMethod: "Cash",         Notes: "Winter quarter general meeting", Status: "auto",   SubmittedBy: "Daniel Kim" },
];

const tables = [
  { tableName: "AWS Cloud Club", clubName: "AWS Cloud Club", receipts: awsReceipts },
  { tableName: "Bruin AI",       clubName: "Bruin AI",       receipts: bruinAiReceipts },
  { tableName: "IEEE",           clubName: "IEEE",           receipts: ieeeReceipts },
];

// ── Airtable helpers ───────────────────────────────────────────────────────

async function listAll(tableName) {
  let records = [];
  let offset = null;
  do {
    const url = `${API_URL}/${BASE_ID}/${encodeURIComponent(tableName)}?fields%5B%5D=ReceiptID${offset ? `&offset=${offset}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${API_TOKEN}` } });
    if (!res.ok) throw new Error(`List ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);
  return records;
}

async function deleteBatch(tableName, ids) {
  // Airtable allows up to 10 deletes per request
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const qs = chunk.map((id) => `records[]=${id}`).join("&");
    const url = `${API_URL}/${BASE_ID}/${encodeURIComponent(tableName)}?${qs}`;
    const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${API_TOKEN}` } });
    if (!res.ok) throw new Error(`Delete ${res.status}: ${await res.text()}`);
    console.log(`  Deleted ${chunk.length} records`);
  }
}

async function insertBatch(tableName, records) {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const res = await fetch(`${API_URL}/${BASE_ID}/${encodeURIComponent(tableName)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: batch.map((r) => ({ fields: r })), typecast: true }),
    });
    if (!res.ok) throw new Error(`Insert ${res.status}: ${await res.text()}`);
    const data = await res.json();
    console.log(`  Inserted ${data.records.length} records`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  for (const { tableName, clubName, receipts } of tables) {
    console.log(`\n── ${tableName} ──`);

    // 1. Clear existing records
    const existing = await listAll(tableName);
    if (existing.length > 0) {
      console.log(`  Deleting ${existing.length} existing records…`);
      await deleteBatch(tableName, existing.map((r) => r.id));
    }

    // 2. Insert fresh records
    console.log(`  Inserting ${receipts.length} new records…`);
    const prepared = receipts.map((r, i) => ({
      ...r,
      Part: clubName,
      Currency: "USD",
      ReceiptID: rid(),
      Timestamp: new Date(`${r.Date}T${String(9 + i).padStart(2, "0")}:00:00Z`).toISOString(),
    }));
    await insertBatch(tableName, prepared);
  }

  console.log("\nDone — all clubs re-seeded with item-specific receipts.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
