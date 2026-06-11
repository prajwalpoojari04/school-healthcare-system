const Student = require("../models/Student");
const MedicalRecord = require("../models/MedicalRecord");

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const totalVisits = await MedicalRecord.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisits = await MedicalRecord.countDocuments({
      visitDate: {
        $gte: today,
      },
    });

    const recentVisits = await MedicalRecord.find()
      .populate("student")
      .sort({ visitDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalVisits,
        todayVisits,
      },
      recentVisits,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RECENT VISITS
exports.getRecentVisits = async (req, res) => {
  try {
    const visits = await MedicalRecord.find()
      .populate("student")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    // Disease Analytics
    const analytics = await MedicalRecord.aggregate([
      {
        $group: {
          _id: "$diagnosis",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // Grade Analytics
    const gradeVisits = await MedicalRecord.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $group: {
          _id: "$studentInfo.grade",
          visits: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics,
      gradeVisits,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};