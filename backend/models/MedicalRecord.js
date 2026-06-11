const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    symptoms: [
      {
        type: String,
        required: true,
      },
    ],

    diagnosis: {
      type: String,
      required: true,
    },

    medications: [
      {
        type: String,
      },
    ],

    doctorNotes: {
      type: String,
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    treatedBy: {
      type: String,
      default: "School Medical Staff",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);