/**
 * Users API Routes — Google OAuth
 *
 * POST /api/users/google-auth  → Verify Google JWT, find/create user
 * GET  /api/users/:id          → Get user profile
 * PUT  /api/users/:id/parts    → Update club memberships
 */

const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config");
const userService = require("../services/userService");

const router = express.Router();
const googleClient = new OAuth2Client(config.google.clientId);

// Helper — shape user for API response
function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    partIds: user.partIds,
    parts: user.partIds.map((id) => config.parts[id]).filter(Boolean),
    role: user.role || "member",
    adminClubs: user.adminClubs || [],
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/users/google-auth — Verify Google JWT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/google-auth", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  if (!config.google.clientId) {
    return res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured on server" });
  }

  // Step 1: verify JWT with Google
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("[Auth] Google JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid Google credential", detail: err.message });
  }

  // Step 2: find or create user in DynamoDB
  try {
    const googleProfile = {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    console.log(`[Auth] Google sign-in: ${googleProfile.name} (${googleProfile.email})`);
    const { user, isNew } = await userService.findOrCreateFromGoogle(googleProfile);
    res.json({ user: formatUser(user), isNew });
  } catch (err) {
    console.error("[Auth] User lookup/creation failed:", err.message);
    res.status(500).json({ error: "Failed to load user profile", detail: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/users/:id — Get user profile
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /api/users/:id/parts — Update club memberships
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put("/:id/parts", async (req, res) => {
  const { partIds } = req.body;

  if (!partIds || !Array.isArray(partIds) || partIds.length === 0) {
    return res.status(400).json({ error: "Select at least one club" });
  }

  const invalidParts = partIds.filter((id) => !config.parts[id]);
  if (invalidParts.length > 0) {
    return res.status(400).json({ error: `Invalid club IDs: ${invalidParts.join(", ")}` });
  }

  try {
    const user = await userService.updateUserParts(req.params.id, partIds);
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
