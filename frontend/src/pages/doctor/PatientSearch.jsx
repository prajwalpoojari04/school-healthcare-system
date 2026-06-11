import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageTransition from '../../components/ui/PageTransition';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/tables/DataTable';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { studentService } from '../../services/studentService';
import { getHealthStatusColor } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';

const PatientSearch = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(search);

  const searchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = debouncedSearch
        ? await studentService.search(debouncedSearch)
        : await studentService.getAll();
      setPatients(data.students || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    searchPatients();
  }, [searchPatients]);

  const columns = [
    {
      key: 'name',
      label: 'Patient',
      render: (r) => `${r.firstName} ${r.lastName}`,
    },
    { key: 'studentId', label: 'Admission No.' },
    { key: 'bloodType', label: 'Blood Type' },
    {
      key: 'allergies',
      label: 'Allergies',
      render: (r) => r.allergies?.join(', ') || 'None',
    },
    {
      key: 'healthStatus',
      label: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getHealthStatusColor(r.healthStatus)}`}>
          {r.healthStatus}
        </span>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patients by name or ID..." className="max-w-lg" />
        <div className="glass-card">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={searchPatients} />
          ) : (
            <DataTable
              columns={columns}
              data={patients}
              onRowClick={(r) => navigate(`/students/${r.id}`)}
              emptyMessage="No patients found"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PatientSearch;
