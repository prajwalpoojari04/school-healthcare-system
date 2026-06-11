const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRecentVisits,
  getAnalytics,
} = require("../controllers/dashboardController");

const {
  protect,
  roleCheck,
} = require("../middleware/authMiddleware");

// ─── FIX #4: Was unprotected (public). Now requires valid token ──────────────
router.get("/", protect, getDashboardStats);

// ─── FIX #5: Was adminOnly. Now Admin + Doctor + Nurse can access ─────────────
// Parent dashboard should NOT see school-wide visit data — kept out intentionally
router.get(
  "/recent-visits",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  getRecentVisits
);

router.get(
  "/analytics",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  getAnalytics
);

module.exports = router;
