/**
 * Parts API Route
 *
 * GET /api/parts — Return list of available parts/clubs
 */

const express = require("express");
const config = require("../config");

const router = express.Router();

router.get("/", (req, res) => {
  const parts = Object.values(config.parts).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  res.json({ parts });
});

module.exports = router;
