const express = require("express");

const {
  createStudent,
  getStudents,
  getStudent,
  getStudentSummary,
  updateStudent,
  deleteStudent,
  searchStudents,
} = require("../controllers/studentController");

const {
  protect,
  adminOnly,
  roleCheck,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ─── WRITE ROUTES: Admin only (enrollment management) ────────────────────────
router.post("/", protect, adminOnly, createStudent);
router.put("/:id", protect, adminOnly, updateStudent);
router.delete("/:id", protect, adminOnly, deleteStudent);

// ─── READ ROUTES: Admin + Doctor + Nurse (clinical access) ───────────────────
// FIX #7: Was adminOnly on all GET routes — Doctors/Nurses couldn't see patients

// IMPORTANT: /search and /:id/summary MUST come before /:id
router.get(
  "/search",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  searchStudents
);

router.get(
  "/:id/summary",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  getStudentSummary
);

router.get(
  "/",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  getStudents
);

router.get(
  "/:id",
  protect,
  roleCheck("Admin", "Doctor", "Nurse"),
  getStudent
);

module.exports = router;
