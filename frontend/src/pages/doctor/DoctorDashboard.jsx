import { useNavigate } from 'react-router-dom';
import { FiUsers, FiFileText, FiClipboard, FiAlertCircle } from 'react-icons/fi';
import { useEffect, useState, useCallback } from 'react';
import PageTransition from '../../components/ui/PageTransition';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/tables/DataTable';
import { CardSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { dashboardService } from '../../services/dashboardService';
import { studentService } from '../../services/studentService';
import { formatDate } from '../../utils/helpers';
import AIRecommendationCard from '../../components/doctor/AIRecommendationCard';
import { getAIRecommendation } from '../../services/aiService';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, cases, studentsData] = await Promise.all([
        dashboardService.getDashboard(),
        dashboardService.getRecentCases(5),
        studentService.getAll(),
      ]);
      setDashboard(dashData);
      setRecentCases(cases);
      setPatients(studentsData.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateRecommendation = async () => {
    if (!selectedPatientId) {
      setAiError('Select a patient before generating a recommendation.');
      return;
    }

    if (!symptoms.trim()) {
      setAiError('Enter current symptoms before generating a recommendation.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const data = await getAIRecommendation(selectedPatientId, symptoms);
      setRecommendation(data);
    } catch (err) {
      console.error('AI Error:', err);
      setAiError('Failed to generate recommendation. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const columns = [
    { key: 'studentName', label: 'Patient' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'doctorName', label: 'Treated By' },
  ];

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={fetchData} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Today's Patients"  value={dashboard?.todayVisits    || 0} icon={FiUsers}      color="teal"   index={0} />
          <DashboardCard title="Total Visits"       value={dashboard?.totalVisits     || 0} icon={FiFileText}   color="blue"   index={1} />
          <DashboardCard title="Total Students"     value={dashboard?.totalStudents   || 0} icon={FiClipboard}  color="purple" index={2} />
          <DashboardCard title="Recent Cases"       value={recentCases.length}              icon={FiAlertCircle} color="red"    index={3} />
        </div>

        {/* ── AI Recommendation card — only mounts when data exists ── */}
        {recommendation && (
          <AIRecommendationCard recommendation={recommendation} patient={selectedPatient} />
        )}

        {/* ── AI error banner ────────────────────────────────────────── */}
        {aiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {aiError}
          </div>
        )}

        {/* ── Main content row ───────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent cases table */}
          <div className="glass-card lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Cases</h3>
            <DataTable
              columns={columns}
              data={recentCases}
              onRowClick={(r) => navigate(`/medical-records/${r.id}`)}
              emptyMessage="No recent cases"
            />
          </div>

          {/* Quick actions */}
          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Search Patients',        path: '/doctor/patients'      },
                { label: 'Manage Prescriptions',   path: '/doctor/prescriptions' },
                { label: 'View Cases',             path: '/doctor/cases'         },
                { label: 'Health Alerts',          path: '/alerts'               },
              ].map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-health-50 hover:text-health-700 dark:border-slate-700 dark:hover:bg-health-900/20"
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
              <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">AI Recommendation</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="ai-patient" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Patient
                  </label>
                  <select
                    id="ai-patient"
                    value={selectedPatientId}
                    onChange={(event) => {
                      setSelectedPatientId(event.target.value);
                      setRecommendation(null);
                      setAiError(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-health-500 focus:ring-2 focus:ring-health-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.studentId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ai-symptoms" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Current Symptoms
                  </label>
                  <textarea
                    id="ai-symptoms"
                    value={symptoms}
                    onChange={(event) => {
                      setSymptoms(event.target.value);
                      setAiError(null);
                    }}
                    rows={4}
                    placeholder="Fever, headache, nausea..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-health-500 focus:ring-2 focus:ring-health-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateRecommendation}
              disabled={aiLoading || patients.length === 0}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? 'Generating...' : 'Generate AI Recommendation'}
            </button>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default DoctorDashboard;
