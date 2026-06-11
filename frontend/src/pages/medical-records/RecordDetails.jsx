import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiClipboard } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/helpers';

const RecordDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicalRecordService.getById(id);
      setRecord(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  if (loading) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchRecord} />;
  if (!record) return <div className="py-20 text-center">Record not found</div>;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <button onClick={() => navigate('/medical-records')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-health-600">
          <FiArrowLeft className="h-4 w-4" /> Back to Records
        </button>

        <div className="glass-card">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{record.diagnosis}</h2>
              <p className="text-slate-500">{record.studentName} · {formatDate(record.date)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              record.visitType === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-health-100 text-health-700'
            }`}>{record.visitType}</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <FiClipboard className="h-4 w-4" /> Symptoms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {record.symptoms?.map((s) => (
                    <span key={s} className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Medications</h3>
                <div className="space-y-2">
                  {record.medications?.length ? record.medications.map((m) => (
                    <div key={m} className="rounded-lg border border-health-200 bg-health-50 px-3 py-2 text-sm dark:border-health-800 dark:bg-health-900/20">{m}</div>
                  )) : <p className="text-sm text-slate-500">No medications prescribed</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <FiUser className="h-4 w-4" /> Treated By
                </h3>
                <p className="text-sm">{record.doctorName || 'N/A'}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor Notes</h3>
                <p className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                  {record.doctorNotes || 'No additional notes'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RecordDetails;
