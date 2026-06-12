const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alertRoutes = require("./routes/alertRoutes");
const aiRoutes = require("./routes/aiRoutes");           // ← ADD THIS

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);                            // ← ADD THIS

app.get("/", (req, res) => {
  res.send("School Healthcare API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});