import { useEffect, useState, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/helpers';

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { records } = await medicalRecordService.getAll();
      const derived = records.flatMap((record) =>
        (record.medications || []).map((medication, index) => ({
          id: `${record.id}-${index}`,
          patient: record.studentName,
          medication,
          dosage: 'See medical record',
          status: 'active',
          date: formatDate(record.date),
          recordId: record.id,
        }))
      );
      setPrescriptions(derived);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const columns = [
    { key: 'patient', label: 'Patient' },
    { key: 'medication', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="rounded-full bg-health-100 px-2.5 py-0.5 text-xs font-medium text-health-700 capitalize dark:bg-health-900/30 dark:text-health-400">
          {r.status}
        </span>
      ),
    },
    { key: 'date', label: 'Date' },
  ];

  const onSubmit = async (data) => {
    toast.error('Prescriptions are managed through medical records. Create a new medical record to add medications.');
    reset();
    setModalOpen(false);
  };

  if (loading) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchPrescriptions} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-xl gradient-health px-4 py-2.5 text-sm font-semibold text-white">
            <FiPlus className="h-4 w-4" /> New Prescription
          </button>
        </div>
        <div className="glass-card">
          {prescriptions.length === 0 ? (
            <EmptyState title="No prescriptions" description="Medications from medical records will appear here." />
          ) : (
            <DataTable columns={columns} data={prescriptions} />
          )}
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Prescription">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-slate-500">Prescriptions are added via medical records. Use the medical records page to create a record with medications.</p>
            <FormInput label="Patient Name" name="patient" register={register} {...register('patient')} />
            <FormInput label="Medication" name="medication" register={register} {...register('medication')} />
            <FormInput label="Dosage" name="dosage" register={register} {...register('dosage')} />
            <FormTextarea label="Notes" name="notes" register={register} />
            <button type="submit" className="w-full rounded-xl gradient-health py-2.5 text-sm font-semibold text-white">Close</button>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default PrescriptionManagement;
