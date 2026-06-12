const mongoose = require("mongoose");

const aiRecommendationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    possibleCondition: {
      type: String,
    },

    reasoning: {
      type: String,
    },

    recommendedMedicines: [
      {
        name: String,
        dosage: String,
        purpose: String,
      },
    ],

    medicinesToAvoid: [
      {
        name: String,
        reason: String,
      },
    ],

    urgencyLevel: {
      type: String,
      enum: ["low", "moderate", "high", "emergency"],
      default: "low",
    },

    disclaimer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIRecommendation",
  aiRecommendationSchema
);