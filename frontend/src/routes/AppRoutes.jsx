import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ROLE_ROUTES, normalizeRole } from '../utils/helpers';

// ── NEW COMPONENT IMPORT ──
import LandingPage from '../pages/public/LandingPage';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

import DashboardHome from '../pages/dashboard/DashboardHome';
import StudentsList from '../pages/students/StudentsList';
import StudentDetails from '../pages/students/StudentDetails';
import AddStudent from '../pages/students/AddStudent';
import EditStudent from '../pages/students/EditStudent';

import MedicalRecordsList from '../pages/medical-records/MedicalRecordsList';
import CreateMedicalRecord from '../pages/medical-records/CreateMedicalRecord';
import RecordDetails from '../pages/medical-records/RecordDetails';

import HealthAlerts from '../pages/alerts/HealthAlerts';
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';

import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientSearch from '../pages/doctor/PatientSearch';
import PrescriptionManagement from '../pages/doctor/PrescriptionManagement';
import CaseManagement from '../pages/doctor/CaseManagement';

import NurseDashboard from '../pages/nurse/NurseDashboard';
import StudentCheckIn from '../pages/nurse/StudentCheckIn';
import MedicalRecordsEntry from '../pages/nurse/MedicalRecordsEntry';

import ParentDashboard from '../pages/parent/ParentDashboard';
import ChildHealthRecords from '../pages/parent/ChildHealthRecords';
import DownloadReports from '../pages/parent/DownloadReports';
import Notifications from '../pages/parent/Notifications';

const RoleRedirect = () => {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const target = ROLE_ROUTES[normalizedRole] || '/dashboard';
  console.log('[RoleRedirect]', { user, role: user?.role, normalizedRole, target });
  return <Navigate to={target} replace />;
};

const AppRoutes = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[AppRoutes]', {
      pathname: location.pathname,
      user,
      role: user?.role,
      loading,
    });
  }, [location.pathname, user, loading]);

  return (
    <Routes>
      {/* ── UNPROTECTED PUBLIC ROUTES ── */}
      {/* The root link now delivers your cinematic landing display directly */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── USER SESSION LANDING ZONE ── */}
      {/* Moved the internal automated redirect engine to /home */}
      <Route path="/home" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* ── PROTECTED ROUTE MATRIX (ALL UNTOUCHED) ── */}
      <Route element={<ProtectedRoute roles={['Admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Route>

      <Route element={<ProtectedRoute roles={['Admin', 'Nurse', 'Doctor']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/students" element={<StudentsList />} />
        <Route path="/students/add" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentDetails />} />
        <Route path="/students/:id/edit" element={<EditStudent />} />
      </Route>

      <Route element={<ProtectedRoute roles={['Admin', 'Doctor', 'Nurse', 'Parent']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/medical-records" element={<MedicalRecordsList />} />
        <Route path="/medical-records/create" element={<CreateMedicalRecord />} />
        <Route path="/medical-records/:id" element={<RecordDetails />} />
      </Route>

      <Route element={<ProtectedRoute roles={['Admin', 'Doctor', 'Nurse']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/alerts" element={<HealthAlerts />} />
      </Route>

      <Route element={<ProtectedRoute roles={['Doctor']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<PatientSearch />} />
        <Route path="/doctor/prescriptions" element={<PrescriptionManagement />} />
        <Route path="/doctor/cases" element={<CaseManagement />} />
      </Route>

      <Route element={<ProtectedRoute roles={['Nurse']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/nurse" element={<NurseDashboard />} />
        <Route path="/nurse/check-in" element={<StudentCheckIn />} />
        <Route path="/nurse/records" element={<MedicalRecordsEntry />} />
      </Route>

      <Route element={<ProtectedRoute roles={['Parent']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/records" element={<ChildHealthRecords />} />
        <Route path="/parent/reports" element={<DownloadReports />} />
        <Route path="/parent/notifications" element={<Notifications />} />
      </Route>

      {/* Route Fallback Shield matches new Root pattern */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;