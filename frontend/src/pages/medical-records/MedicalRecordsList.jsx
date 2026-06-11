import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/tables/DataTable';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';

const MedicalRecordsList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [diagnosisFilter, setDiagnosisFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicalRecordService.getAll();
      let result = data.records || [];
      if (debouncedSearch) {
        result = result.filter(
          (r) =>
            r.studentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            r.diagnosis?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      if (diagnosisFilter) {
        result = result.filter((r) =>
          r.diagnosis?.toLowerCase().includes(diagnosisFilter.toLowerCase())
        );
      }
      if (dateFilter) {
        result = result.filter((r) => {
          const recordDate = new Date(r.date).toISOString().split('T')[0];
          return recordDate === dateFilter;
        });
      }
      setRecords(result);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, diagnosisFilter, dateFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'studentName', label: 'Student' },
    { key: 'diagnosis', label: 'Diagnosis' },
    {
      key: 'symptoms',
      label: 'Symptoms',
      render: (r) => (
        <span className="text-xs">{r.symptoms?.slice(0, 2).join(', ')}{r.symptoms?.length > 2 ? '...' : ''}</span>
      ),
    },
    { key: 'doctorName', label: 'Doctor' },
    {
      key: 'visitType',
      label: 'Type',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
          r.visitType === 'emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800'
        }`}>{r.visitType}</span>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search records..." className="max-w-xs" />
            <input
              type="text"
              value={diagnosisFilter}
              onChange={(e) => setDiagnosisFilter(e.target.value)}
              placeholder="Filter by diagnosis"
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-800/80"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-800/80"
            />
          </div>
          <button
            onClick={() => navigate('/medical-records/create')}
            className="flex items-center gap-2 rounded-xl gradient-health px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            <FiPlus className="h-4 w-4" /> New Record
          </button>
        </div>

        <div className="glass-card">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchRecords} />
          ) : (
            <DataTable columns={columns} data={records} onRowClick={(r) => navigate(`/medical-records/${r.id}`)} />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MedicalRecordsList;
