export const getApiErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message || error?.message || fallback;

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export const normalizeStudent = (student) => {
  if (!student) return null;
  const id = student._id || student.id;
  const age = student.age ?? calculateAge(student.dateOfBirth);
  const hasConditions = student.medicalConditions?.length > 0;
  return {
    ...student,
    id,
    studentId: student.admissionNumber || student.studentId,
    bloodType: student.bloodGroup || student.bloodType,
    grade: student.grade || 'N/A',
    age: age ?? 'N/A',
    healthStatus:
      student.healthStatus ||
      (hasConditions ? 'monitoring' : 'healthy'),
    lastVisit: student.lastVisit,
    emergencyContacts:
      student.emergencyContacts ||
      (student.emergencyContactName
        ? [
            {
              name: student.emergencyContactName,
              relation: student.emergencyRelation || 'Emergency Contact',
              phone: student.emergencyContactNumber,
            },
          ]
        : []),
  };
};

export const normalizeMedicalRecord = (record) => {
  if (!record) return null;
  const student = record.student;
  const studentName =
    typeof student === 'object' && student
      ? `${student.firstName} ${student.lastName}`
      : record.studentName || 'Unknown';
  const studentId =
    typeof student === 'object' && student
      ? student._id || student.id
      : record.studentId || record.student;
  return {
    ...record,
    student,
    id: record._id || record.id,
    studentId,
    studentName,
    date: record.visitDate || record.date,
    doctorName: record.treatedBy || record.doctorName,
    visitType: record.visitType || 'routine',
  };
};

export const normalizeRecentVisit = (record) => {
  const normalized = normalizeMedicalRecord(record);
  return {
    id: normalized.id,
    studentName: normalized.studentName,
    time: normalized.date
      ? new Date(normalized.date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A',
    reason: normalized.diagnosis || 'Visit',
    status: 'completed',
  };
};

export const normalizeDashboardStats = (data) => {
  const stats = data.stats || data;
  return {
    totalStudents: stats.totalStudents ?? 0,
    totalVisits: stats.totalVisits ?? 0,
    todayVisits: stats.todayVisits ?? 0,
    emergencyCases: stats.emergencyCases ?? 0,
    lowStockMedicines: stats.lowStockMedicines ?? 0,
    diseaseTrends: data.diseaseTrends || [],
    visitStatistics: data.visitStatistics || [],
    healthAnalytics: data.healthAnalytics || [],
    recentVisits: (data.recentVisits || []).map(normalizeRecentVisit),
  };
};

export const normalizeAlerts = (data) => {
  const students = data.alerts || data.students || [];
  const allergies = [];
  const chronicConditions = [];
  const highRiskStudents = [];

  students.forEach((rawStudent) => {
    const student = normalizeStudent(rawStudent);
    const studentName = `${student.firstName} ${student.lastName}`;
    const studentId = student.id;

    (student.allergies || []).forEach((allergy, index) => {
      allergies.push({
        id: `${studentId}-allergy-${index}`,
        studentName,
        studentId,
        allergy,
        severity: 'severe',
      });
    });

    (student.medicalConditions || []).forEach((condition, index) => {
      chronicConditions.push({
        id: `${studentId}-condition-${index}`,
        studentName,
        studentId,
        condition,
        severity: 'high',
      });
      highRiskStudents.push({
        id: `${studentId}-risk-${index}`,
        studentName,
        studentId,
        risk: condition,
        severity: 'critical',
        lastIncident: student.updatedAt
          ? formatDate(student.updatedAt)
          : undefined,
      });
    });
  });

  return { allergies, chronicConditions, highRiskStudents };
};

export const toStudentPayload = (data) => ({
  admissionNumber: data.admissionNumber || data.studentId,
  firstName: data.firstName,
  lastName: data.lastName,
  dateOfBirth: data.dateOfBirth,
  gender: data.gender,

  // ADD THIS LINE
  grade: data.grade,

  bloodGroup: data.bloodGroup || data.bloodType,
  allergies: data.allergies || [],
  medicalConditions: data.medicalConditions || [],

  emergencyContactName:
    data.emergencyContactName || data.emergencyName,

  emergencyContactNumber:
    data.emergencyContactNumber || data.emergencyPhone,

  parentEmail: data.parentEmail,
  address: data.address,

  height: data.height ? Number(data.height) : undefined,
  weight: data.weight ? Number(data.weight) : undefined,
});

export const toMedicalRecordPayload = (data) => ({
  student: data.student || data.studentId,
  symptoms: data.symptoms,
  diagnosis: data.diagnosis,
  medications: data.medications || [],
  doctorNotes: data.doctorNotes,
  visitDate: data.visitDate || data.date || new Date().toISOString(),
  treatedBy: data.treatedBy || data.doctorName || 'School Medical Staff',
});

export const findChildForParent = (records, parentEmail) => {
  if (!parentEmail) return null;
  for (const record of records) {
    const student = record.student;
    if (typeof student === 'object' && student?.parentEmail === parentEmail) {
      return normalizeStudent(student);
    }
  }
  return null;
};

export const filterRecordsForParent = (records, parentEmail) =>
  records.filter((record) => {
    const student = record.student;
    return typeof student === 'object' && student?.parentEmail === parentEmail;
  });

export const formatTime = (time) => time || 'N/A';

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getHealthStatusColor = (status) => {
  const colors = {
    healthy: 'bg-health-100 text-health-700 dark:bg-health-900/30 dark:text-health-400',
    stable: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    monitoring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'high-risk': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || colors.stable;
};

export const getSeverityColor = (severity) => {
  const colors = {
    low: 'border-l-health-500 bg-health-50 dark:bg-health-900/20',
    moderate: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
    high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
    severe: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
    critical: 'border-l-red-600 bg-red-100 dark:bg-red-900/30',
  };
  return colors[severity] || colors.moderate;
};

export const paginate = (array, page, perPage) => {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
};

export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  PARENT: 'Parent',
};

export const ROLE_ROUTES = {
  Admin: '/dashboard',
  Doctor: '/doctor',
  Nurse: '/nurse',
  Parent: '/parent',
};

export const normalizeRole = (role) => {
  if (!role) return null;
  const map = {
    admin: 'Admin',
    doctor: 'Doctor',
    nurse: 'Nurse',
    parent: 'Parent',
    Admin: 'Admin',
    Doctor: 'Doctor',
    Nurse: 'Nurse',
    Parent: 'Parent',
  };
  return map[role] || role;
};

export const hasRoleAccess = (userRole, allowedRoles = []) => {
  const normalizedUser = normalizeRole(userRole);
  return allowedRoles.some((role) => normalizeRole(role) === normalizedUser);
};

export const ROLE_LABELS = {
  Admin: 'Administrator',
  Doctor: 'Doctor',
  Nurse: 'Nurse',
  Parent: 'Parent',
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  parent: 'Parent',
};
