import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiFilter } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/tables/DataTable';
import Pagination from '../../components/tables/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { studentService } from '../../services/studentService';
import { getHealthStatusColor, paginate } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';

const PER_PAGE = 10;

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = debouncedSearch
        ? await studentService.search(debouncedSearch)
        : await studentService.getAll();
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchStudents();
    setPage(1);
  }, [fetchStudents]);

  const filtered = gradeFilter
    ? students.filter((s) => s.grade === gradeFilter)
    : students;

  const paginated = paginate(filtered, page, PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-health-100 text-sm font-bold text-health-700 dark:bg-health-900/30 dark:text-health-400">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="font-medium">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-slate-400">{row.studentId}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', label: 'Grade' },
    { key: 'age', label: 'Age' },
    { key: 'bloodType', label: 'Blood Type' },
    {
      key: 'healthStatus',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getHealthStatusColor(row.healthStatus)}`}>
          {row.healthStatus}
        </span>
      ),
    },
    { key: 'lastVisit', label: 'Last Visit', render: (row) => row.lastVisit || 'N/A' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search students..."
              className="max-w-md"
            />
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-8 text-sm outline-none dark:border-slate-700 dark:bg-slate-800/80"
              >
                <option value="">All Grades</option>
                {['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => navigate('/students/add')}
            className="flex items-center gap-2 rounded-xl gradient-health px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <FiPlus className="h-4 w-4" />
            Add Student
          </button>
        </div>

        <div className="glass-card">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchStudents} />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginated}
                onRowClick={(row) => navigate(`/students/${row.id}`)}
              />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentsList;
