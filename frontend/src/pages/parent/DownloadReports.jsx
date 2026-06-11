import { useEffect, useState, useCallback } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageTransition from '../../components/ui/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { medicalRecordService } from '../../services/medicalRecordService';
import { filterRecordsForParent, formatDate } from '../../utils/helpers';

const DownloadReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { records } = await medicalRecordService.getAll();
      const childRecords = filterRecordsForParent(records, user?.email);
      setReports(
        childRecords.map((record) => ({
          id: record.id,
          title: `${record.diagnosis} - ${formatDate(record.date)}`,
          type: 'Medical Record',
          date: formatDate(record.date),
          record,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = (report) => {
    const content = JSON.stringify(report.record, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${report.title}`);
  };

  if (loading) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="glass-card">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Download Reports</h2>
          <p className="text-sm text-slate-500">Access and download your child's health reports</p>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            icon={FiFileText}
            title="No reports available"
            description="Medical records linked to your account will appear here for download."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((report) => (
              <div key={report.id} className="glass-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-health-100 dark:bg-health-900/30">
                    <FiFileText className="h-6 w-6 text-health-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{report.title}</p>
                    <p className="text-xs text-slate-500">{report.type} · {report.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-health-50 hover:text-health-700 dark:border-slate-700 dark:hover:bg-health-900/20"
                >
                  <FiDownload className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default DownloadReports;
