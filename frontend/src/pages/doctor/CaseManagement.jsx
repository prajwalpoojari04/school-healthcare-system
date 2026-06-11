import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageTransition from '../../components/ui/PageTransition';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/tables/DataTable';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';

const CaseManagement = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(search);

  const fetchCases = useCallback(async () => {
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
      setCases(result);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const columns = [
    { key: 'studentName', label: 'Patient' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'doctorName', label: 'Assigned Doctor' },
    {
      key: 'visitType',
      label: 'Case Type',
      render: (r) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
          r.visitType === 'emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'
        }`}>{r.visitType}</span>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search cases..." className="max-w-xs" />
        <div className="glass-card">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCases} />
          ) : (
            <DataTable columns={columns} data={cases} onRowClick={(r) => navigate(`/medical-records/${r.id}`)} emptyMessage="No cases found" />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CaseManagement;
