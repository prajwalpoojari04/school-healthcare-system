const express = require("express");
const router = express.Router();

const { getHealthAlerts } = require("../controllers/alertController");

const {
  protect,
  roleCheck,
} = require("../middleware/authMiddleware");

// ─── FIX #8: Was completely unprotected (no auth). Student allergy/condition ──
// data is sensitive — now requires authenticated Admin, Doctor, or Nurse.
router.get(
  "/",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  getHealthAlerts
);

module.exports = router;
