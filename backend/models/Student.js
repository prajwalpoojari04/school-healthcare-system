const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
    },

    height: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    allergies: [
      {
        type: String,
      },
    ],

    medicalConditions: [
      {
        type: String,
      },
    ],

    emergencyContactName: {
      type: String,
      required: true,
    },

    emergencyContactNumber: {
      type: String,
      required: true,
    },

    parentEmail: {
      type: String,
    },

    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);