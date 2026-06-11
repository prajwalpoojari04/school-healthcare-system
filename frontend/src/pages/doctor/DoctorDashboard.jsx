import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiFileText, FiClipboard, FiAlertCircle } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/tables/DataTable';
import { CardSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { dashboardService } from '../../services/dashboardService';
import { formatDate } from '../../utils/helpers';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, cases] = await Promise.all([
        dashboardService.getDashboard(),
        dashboardService.getRecentCases(5),
      ]);
      setDashboard(dashData);
      setRecentCases(cases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { key: 'studentName', label: 'Patient' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'doctorName', label: 'Treated By' },
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Today's Patients" value={dashboard?.todayVisits || 0} icon={FiUsers} color="teal" index={0} />
          <DashboardCard title="Total Visits" value={dashboard?.totalVisits || 0} icon={FiFileText} color="blue" index={1} />
          <DashboardCard title="Total Students" value={dashboard?.totalStudents || 0} icon={FiClipboard} color="purple" index={2} />
          <DashboardCard title="Recent Cases" value={recentCases.length} icon={FiAlertCircle} color="red" index={3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Cases</h3>
            <DataTable columns={columns} data={recentCases} onRowClick={(r) => navigate(`/medical-records/${r.id}`)} emptyMessage="No recent cases" />
          </div>
          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Search Patients', path: '/doctor/patients' },
                { label: 'Manage Prescriptions', path: '/doctor/prescriptions' },
                { label: 'View Cases', path: '/doctor/cases' },
                { label: 'Health Alerts', path: '/alerts' },
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
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DoctorDashboard;
