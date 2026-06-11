const Student = require("../models/Student");
const MedicalRecord = require("../models/MedicalRecord");

// CREATE STUDENT
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL STUDENTS
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET STUDENT SUMMARY


// GET SINGLE STUDENT
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE STUDENT
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Student deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SEARCH STUDENTS
exports.searchStudents = async (req, res) => {
  try {
    const name = req.query.name || "";

    const students = await Student.find({
      $or: [
        {
          firstName: {
            $regex: name,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: name,
            $options: "i",
          },
        },
        {
          admissionNumber: {
            $regex: name,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET STUDENT SUMMARY
exports.getStudentSummary = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const records = await MedicalRecord.find({
      student: req.params.id,
    });

    const latestRecord =
      records.length > 0
        ? records[records.length - 1]
        : null;

    res.status(200).json({
      success: true,
      student,
      totalVisits: records.length,
      latestDiagnosis:
        latestRecord?.diagnosis || "No Records",
      allergies: student.allergies,
      medicalConditions:
        student.medicalConditions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
