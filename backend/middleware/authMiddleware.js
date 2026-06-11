const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

// ─── FIX #1: Was "admin" (lowercase) — DB stores "Admin" (PascalCase) ─────────
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

exports.doctorOnly = (req, res, next) => {
  if (req.user.role !== "Doctor") {
    return res.status(403).json({
      success: false,
      message: "Doctor access only",
    });
  }
  next();
};

exports.nurseOnly = (req, res, next) => {
  if (req.user.role !== "Nurse") {
    return res.status(403).json({
      success: false,
      message: "Nurse access only",
    });
  }
  next();
};

exports.parentOnly = (req, res, next) => {
  if (req.user.role !== "Parent") {
    return res.status(403).json({
      success: false,
      message: "Parent access only",
    });
  }
  next();
};

// ─── NEW: Multi-role helper — allows any of the given roles to proceed ────────
// Usage: roleCheck("Admin", "Doctor", "Nurse")
exports.roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access restricted to: ${roles.join(", ")}`,
      });
    }
    next();
  };
};
