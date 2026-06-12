/**
 * backend/controllers/aiController.js
 *
 * Handles AI medicine recommendation requests.
 * Fetches student + medical history, builds patient context,
 * calls Gemini, and returns structured JSON.
 *
 * CommonJS syntax — no ES Modules.
 */
const mongoose = require("mongoose");
const AIRecommendation = require("../models/AIRecommendation");

const Student     = require('../models/Student');
const MedicalRecord = require('../models/MedicalRecord');
const { generateMedicineRecommendation } = require('../config/openrouter');



// ── Helper: calculate age from date of birth ──────────────────────────────
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'Unknown';
  const today = new Date();
  const dob   = new Date(dateOfBirth);
  let age     = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// ── POST /api/ai/recommend ────────────────────────────────────────────────
/**
 * getMedicineRecommendation
 *
 * Request body:
 * {
 *   studentId:      string  — MongoDB _id of the student
 *   currentSymptoms: string — free-text symptoms from the nurse/doctor
 * }
 *
 * Response (200):
 * {
 *   success: true,
 *   data: {
 *     possibleCondition,
 *     reasoning,
 *     recommendedMedicines,
 *     medicinesToAvoid,
 *     urgencyLevel,
 *     disclaimer
 *   }
 * }
 */
const getMedicineRecommendation = async (req, res) => {
//   console.log('AI ROUTE HIT');
// console.log(req.body);
  try {
    const { studentId, currentSymptoms } = req.body;

    // ── 1. Validate input ───────────────────────────────────────────────
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required.',
      });
    }

    if (!currentSymptoms || currentSymptoms.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'currentSymptoms is required.',
      });
    }

    // ── 2. Fetch student ────────────────────────────────────────────────
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // ── 3. Fetch last 5 medical records for this student ────────────────
    const medicalRecords = await MedicalRecord.find({ student: studentId })
      .sort({ visitDate: -1 })
      .limit(5)
      .lean();

    // ── 4. Build patient context for Gemini ─────────────────────────────
    const recentRecords = medicalRecords.map((record) => ({
      visitDate:   record.visitDate,
      symptoms:    record.symptoms,
      diagnosis:   record.diagnosis,
      medications: record.medications,
      doctorNotes: record.doctorNotes,
      treatedBy:   record.treatedBy,
    }));

    const recentDiagnoses = medicalRecords
      .map((r) => r.diagnosis)
      .filter(Boolean);

    const patientContext = {
      studentName:       `${student.firstName} ${student.lastName}`,
      admissionNumber:   student.admissionNumber,
      age:               calculateAge(student.dateOfBirth),
      gender:            student.gender,
      bloodGroup:        student.bloodGroup        || 'Unknown',
      grade:             student.grade             || 'Unknown',
      allergies:         student.allergies         || [],
      medicalConditions: student.medicalConditions || [],
      currentSymptoms:   currentSymptoms.trim(),
      recentRecords,
      recentDiagnoses,
    };

    // ── 5. Call Gemini ──────────────────────────────────────────────────
// ── 5. Call OpenRouter DeepSeek ─────────────────────────────────────
const recommendation =
  await generateMedicineRecommendation(patientContext);

  await AIRecommendation.create({
  studentId,

  possibleCondition:
    recommendation.possibleCondition,

  reasoning:
    recommendation.reasoning,

  recommendedMedicines:
    recommendation.recommendedMedicines,

  medicinesToAvoid:
    recommendation.medicinesToAvoid,

  urgencyLevel:
    recommendation.urgencyLevel,

  disclaimer:
    recommendation.disclaimer,
});
    // ── 6. Return response ──────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data:    recommendation,
    });

} catch (error) {
  console.error('[aiController] Error:', error.message);

  // OpenRouter / DeepSeek errors
  if (
    error.message.includes('OpenRouter API error') ||
    error.message.includes('Failed to parse AI response')
  ) {
    return res.status(502).json({
      success: false,
      message: 'AI service error. Please try again.',
      error: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error. Please try again.',
    error: error.message,
  });
}
};

const getLatestRecommendation = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("Searching for student:", studentId);

    const recommendation = await AIRecommendation
  .findOne({
    studentId: new mongoose.Types.ObjectId(studentId)
  })
  .sort({ createdAt: -1 })
  .lean();

  console.log("Param:", studentId);
console.log("Type:", typeof studentId);

    console.log("Found:", recommendation);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "No AI recommendation found",
      });
    }

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMedicineRecommendation,
  getLatestRecommendation,
};