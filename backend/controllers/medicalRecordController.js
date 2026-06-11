const MedicalRecord = require("../models/MedicalRecord");

// Create Record
exports.createMedicalRecord = async (req, res) => {
  console.log("BODY RECEIVED:");
  console.log(req.body);

  try {
    const record = await MedicalRecord.create(req.body);

    res.status(201).json({
      success: true,
      record,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Records
exports.getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("student");

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Student Records
exports.getStudentRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      student: req.params.studentId,
    });

    res.json({
      success: true,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};