const express = require("express");

const {
  createMedicalRecord,
  getMedicalRecords,
  getStudentRecords,
} = require("../controllers/medicalRecordController");

const {
  protect,
  roleCheck,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ─── FIX #6: Was adminOnly. Doctors and Nurses must be able to create records ─
router.post(
  "/",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  createMedicalRecord
);

// All authenticated users can read records (Doctor sees patients, Parent sees child)
router.get("/", protect, getMedicalRecords);

router.get("/student/:studentId", protect, getStudentRecords);

module.exports = router;
