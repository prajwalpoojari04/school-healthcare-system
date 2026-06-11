import { useEffect, useState, useCallback } from 'react';
import { FiHeart, FiFileText, FiBell, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/ui/PageTransition';
import DashboardCard from '../../components/ui/DashboardCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { medicalRecordService } from '../../services/medicalRecordService';
import { findChildForParent, filterRecordsForParent, getHealthStatusColor } from '../../utils/helpers';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { records } = await medicalRecordService.getAll();
      const childRecords = filterRecordsForParent(records, user?.email);
      const matchedChild = findChildForParent(records, user?.email);
      setChild(matchedChild);
      setRecordCount(childRecords.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageTransition>
        <LoadingSpinner className="py-20" />
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

  if (!child) {
    return (
      <PageTransition>
        <EmptyState
          icon={FiHeart}
          title="No linked child found"
          description="Medical records linked to your email will appear here once available."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="glass-card">
          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Your Child's Health Overview</h2>
          <p className="text-slate-500">Stay informed about your child's health at school</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Health Status" value={child.healthStatus} icon={FiHeart} color="teal" index={0} />
          <DashboardCard title="Medical Records" value={recordCount} icon={FiFileText} color="blue" index={1} />
          <DashboardCard title="Notifications" value={0} icon={FiBell} color="amber" index={2} />
          <DashboardCard title="Reports Available" value={recordCount > 0 ? 1 : 0} icon={FiDownload} color="purple" index={3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Child Profile</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-health-500 to-primary-500 text-xl font-bold text-white">
                {child.firstName[0]}{child.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{child.firstName} {child.lastName}</p>
                <p className="text-sm text-slate-500">{child.studentId} · Age {child.age}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getHealthStatusColor(child.healthStatus)}`}>
                  {child.healthStatus}
                </span>
              </div>
            </div>
            {child.allergies?.length > 0 && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-xs font-semibold text-red-600">Allergies</p>
                <p className="text-sm text-red-700 dark:text-red-400">{child.allergies.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Links</h3>
            <div className="space-y-3">
              {[
                { label: 'View Health Records', path: '/parent/records' },
                { label: 'Download Reports', path: '/parent/reports' },
                { label: 'Notifications', path: '/parent/notifications' },
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-health-50 hover:text-health-700 dark:border-slate-700 dark:hover:bg-health-900/20"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ParentDashboard;
