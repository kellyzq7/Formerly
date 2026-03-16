/**
 * Admin API Routes
 *
 * GET    /api/admin/clubs/:clubId/receipts           → list all receipts for a club
 * DELETE /api/admin/clubs/:clubId/receipts/:recordId → delete a receipt record
 *
 * All routes require the x-user-id header with a valid admin user ID.
 */

const express = require("express");
const userService = require("../services/userService");
const { getClubReceipts, deleteClubRecord } = require("../services/airtableService");

const router = express.Router();

// ── Auth middleware — verify admin role and club access ──
async function requireAdmin(req, res, next) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Missing x-user-id header" });
  }

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { clubId } = req.params;
    if (clubId && !user.adminClubs.includes(clubId)) {
      return res.status(403).json({ error: "Not authorized for this club" });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    console.error("[Admin] Auth error:", err.message);
    res.status(500).json({ error: "Auth check failed" });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/admin/clubs/:clubId/receipts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/clubs/:clubId/receipts", requireAdmin, async (req, res) => {
  const { clubId } = req.params;

  try {
    const records = await getClubReceipts(clubId);
    res.json({ clubId, records });
  } catch (err) {
    console.error(`[Admin] Failed to fetch receipts for ${clubId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /api/admin/clubs/:clubId/receipts/:recordId
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.delete("/clubs/:clubId/receipts/:recordId", requireAdmin, async (req, res) => {
  const { clubId, recordId } = req.params;

  try {
    await deleteClubRecord(clubId, recordId);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error(`[Admin] Failed to delete record ${recordId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
