import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUserCheck } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import FormSelect from '../../components/forms/FormSelect';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { studentService } from '../../services/studentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { dashboardService } from '../../services/dashboardService';

const StudentCheckIn = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [queue, setQueue] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const [studentsData, visitsData] = await Promise.all([
        studentService.getAll(),
        dashboardService.getRecentVisits(),
      ]);
      setStudents(studentsData.students || []);
      setQueue(visitsData.visits || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await medicalRecordService.create({
        studentId: data.studentId,
        symptoms: [data.reason],
        diagnosis: data.reason,
        doctorNotes: data.notes,
        visitDate: new Date().toISOString(),
      });
      toast.success('Student checked in successfully');
      reset();
      const visitsData = await dashboardService.getRecentVisits();
      setQueue(visitsData.visits || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'studentName', label: 'Student' },
    { key: 'time', label: 'Check-in Time' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="rounded-full bg-health-100 px-2.5 py-0.5 text-xs font-medium text-health-700 capitalize">
          {r.status}
        </span>
      ),
    },
  ];

  if (fetching) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <FiUserCheck className="h-6 w-6 text-health-600" /> Student Check-In
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              label="Student"
              name="studentId"
              register={register}
              required
              error={errors.studentId}
              placeholder="Select student"
              options={students.map((s) => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName} (${s.studentId})`,
              }))}
              {...register('studentId', { required: 'Required' })}
            />
            <FormSelect label="Reason for Visit" name="reason" register={register} required error={errors.reason} options={[
              { value: 'Illness', label: 'Illness' },
              { value: 'Injury', label: 'Injury' },
              { value: 'Medication', label: 'Medication' },
              { value: 'Follow-up', label: 'Follow-up' },
              { value: 'Other', label: 'Other' },
            ]} {...register('reason', { required: 'Required' })} />
            <FormTextarea label="Additional Notes" name="notes" register={register} rows={3} />
            <button type="submit" disabled={loading || students.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl gradient-health py-3 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? <LoadingSpinner size="sm" /> : 'Check In Student'}
            </button>
          </form>
        </div>

        <div className="glass-card">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Today's Check-ins</h3>
          <DataTable columns={columns} data={queue} emptyMessage="No check-ins today" />
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentCheckIn;
