import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageTransition from '../../components/ui/PageTransition';
import DataTable from '../../components/tables/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { FiFileText } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { medicalRecordService } from '../../services/medicalRecordService';
import { filterRecordsForParent, findChildForParent, formatDate } from '../../utils/helpers';

const ChildHealthRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { records: allRecords } = await medicalRecordService.getAll();
      const childRecords = filterRecordsForParent(allRecords, user?.email);
      const child = findChildForParent(allRecords, user?.email);
      setRecords(childRecords);
      setChildName(child ? `${child.firstName} ${child.lastName}` : '');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'diagnosis', label: 'Diagnosis' },
    {
      key: 'symptoms',
      label: 'Symptoms',
      render: (r) => r.symptoms?.join(', '),
    },
    { key: 'doctorName', label: 'Doctor' },
  ];

  if (loading) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchRecords} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="glass-card">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {childName ? `${childName}'s Health Records` : 'Health Records'}
          </h2>
          <p className="text-sm text-slate-500">Complete medical history for your child</p>
        </div>
        <div className="glass-card">
          {records.length === 0 ? (
            <EmptyState
              icon={FiFileText}
              title="No health records"
              description="Records linked to your email will appear here."
            />
          ) : (
            <DataTable
              columns={columns}
              data={records}
              onRowClick={(r) => navigate(`/medical-records/${r.id}`)}
              emptyMessage="No health records found"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ChildHealthRecords;
