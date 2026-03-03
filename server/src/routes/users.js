/**
 * Users API Routes
 *
 * POST /api/users/signup   → Create user with name + selected clubs
 * POST /api/users/login    → Look up existing user by name
 * GET  /api/users/:id      → Get user profile + their clubs
 * PUT  /api/users/:id/parts → Update a user's club memberships
 */

const express = require("express");
const config = require("../config");
const userService = require("../services/userService");

const router = express.Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/users/signup — Create new user
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/signup", (req, res) => {
  const { name, partIds } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!partIds || !Array.isArray(partIds) || partIds.length === 0) {
    return res.status(400).json({ error: "Select at least one club" });
  }

  // Validate all partIds exist
  const invalidParts = partIds.filter((id) => !config.parts[id]);
  if (invalidParts.length > 0) {
    return res.status(400).json({
      error: `Invalid club IDs: ${invalidParts.join(", ")}`,
      validParts: Object.keys(config.parts),
    });
  }

  const user = userService.createUser(name.trim(), partIds);

  res.status(user.alreadyExists ? 200 : 201).json({
    user: {
      id: user.id,
      name: user.name,
      partIds: user.partIds,
      parts: user.partIds.map((id) => config.parts[id]),
    },
    isNew: !user.alreadyExists,
    message: user.alreadyExists
      ? "Welcome back! Logged in with existing account."
      : "Account created successfully.",
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/users/login — Look up user by name
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/login", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const user = userService.getUserByName(name.trim());

  if (!user) {
    return res.status(404).json({
      error: "No account found with that name",
      suggestion: "signup",
    });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      partIds: user.partIds,
      parts: user.partIds.map((id) => config.parts[id]),
    },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/users/:id — Get user profile
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/:id", (req, res) => {
  const user = userService.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      partIds: user.partIds,
      parts: user.partIds.map((id) => config.parts[id]),
    },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /api/users/:id/parts — Update club memberships
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put("/:id/parts", (req, res) => {
  const { partIds } = req.body;

  if (!partIds || !Array.isArray(partIds) || partIds.length === 0) {
    return res.status(400).json({ error: "Select at least one club" });
  }

  const invalidParts = partIds.filter((id) => !config.parts[id]);
  if (invalidParts.length > 0) {
    return res.status(400).json({ error: `Invalid club IDs: ${invalidParts.join(", ")}` });
  }

  try {
    const user = userService.updateUserParts(req.params.id, partIds);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        partIds: user.partIds,
        parts: user.partIds.map((id) => config.parts[id]),
      },
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
