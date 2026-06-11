import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserCheck, FiFileText, FiAlertTriangle, FiClock } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/tables/DataTable';
import { CardSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { dashboardService } from '../../services/dashboardService';
import { alertService } from '../../services/alertService';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, visitsData, alertsData] = await Promise.all([
        dashboardService.getDashboard(),
        dashboardService.getRecentVisits(),
        alertService.getAlerts(),
      ]);
      setDashboard(dashData);
      setRecentVisits(visitsData.visits || []);
      const totalAlerts =
        (alertsData.allergies?.length || 0) +
        (alertsData.chronicConditions?.length || 0);
      setAlertCount(totalAlerts);
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
    { key: 'studentName', label: 'Student' },
    { key: 'time', label: 'Time' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
          r.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
          r.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
          'bg-health-100 text-health-700'
        }`}>{r.status}</span>
      ),
    },
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
          <DashboardCard title="Check-ins Today" value={dashboard?.todayVisits || 0} icon={FiUserCheck} color="teal" index={0} />
          <DashboardCard title="Recent Queue" value={recentVisits.length} icon={FiClock} color="amber" index={1} />
          <DashboardCard title="Total Visits" value={dashboard?.totalVisits || 0} icon={FiFileText} color="blue" index={2} />
          <DashboardCard title="Active Alerts" value={alertCount} icon={FiAlertTriangle} color="red" index={3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Today's Queue</h3>
            <DataTable columns={columns} data={recentVisits} emptyMessage="No visits in queue" />
          </div>
          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Student Check-In', path: '/nurse/check-in' },
                { label: 'Enter Medical Record', path: '/nurse/records' },
                { label: 'View Students', path: '/students' },
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

export default NurseDashboard;
