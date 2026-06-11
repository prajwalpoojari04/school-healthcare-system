import { useEffect, useState, useCallback } from 'react';
import PageTransition from '../../components/ui/PageTransition';
import { CardSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { CommonDiseasesChart, StudentVisitsChart, MonthlyTrendsChart } from '../../components/charts/AnalyticsCharts';
import { analyticsService } from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <PageTransition>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={fetchAnalytics} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="glass-card">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Most Common Diseases</h3>
          {analytics.commonDiseases?.length > 0 ? (
            <CommonDiseasesChart data={analytics.commonDiseases} />
          ) : (
            <EmptyState title="No disease data" description="Diagnosis analytics will appear once medical records exist." />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Student Visits by Grade</h3>
            {analytics.studentVisits?.length > 0 ? (
              <StudentVisitsChart data={analytics.studentVisits} />
            ) : (
              <EmptyState title="No grade visit data" description="Grade-based visit data is not yet available from the API." />
            )}
          </div>
          <div className="glass-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Monthly Trends</h3>
            {analytics.monthlyTrends?.length > 0 ? (
              <MonthlyTrendsChart data={analytics.monthlyTrends} />
            ) : (
              <EmptyState title="No monthly trends" description="Monthly trend data is not yet available from the API." />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AnalyticsDashboard;
