const Student = require("../models/Student");

exports.getHealthAlerts = async (req, res) => {
  try {
    const students = await Student.find({
      $or: [
        { allergies: { $exists: true, $ne: [] } },
        { medicalConditions: { $exists: true, $ne: [] } }
      ]
    });

    res.status(200).json({
      success: true,
      count: students.length,
      alerts: students
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};