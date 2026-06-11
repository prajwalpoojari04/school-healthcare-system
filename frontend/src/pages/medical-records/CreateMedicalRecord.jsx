import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { medicalRecordService } from '../../services/medicalRecordService';
import { studentService } from '../../services/studentService';

const CreateMedicalRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    studentService
      .getAll()
      .then((data) => setStudents(data.students || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setFetchingStudents(false));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const record = await medicalRecordService.create({
        studentId: data.studentId,
        symptoms: data.symptoms.split(',').map((s) => s.trim()),
        medications: data.medications ? data.medications.split(',').map((m) => m.trim()) : [],
        diagnosis: data.diagnosis,
        doctorNotes: data.doctorNotes,
        visitDate: data.date || new Date().toISOString(),
        doctorName: data.doctorName || 'School Medical Staff',
      });
      toast.success('Medical record created');
      navigate(`/medical-records/${record.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => navigate('/medical-records')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-health-600">
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="glass-card">
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Create Medical Record</h2>
          {fetchingStudents ? (
            <LoadingSpinner className="py-10" />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormSelect
                label="Student"
                name="studentId"
                register={register}
                required
                error={errors.studentId}
                placeholder="Select a student"
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName} (${s.studentId})`,
                }))}
                {...register('studentId', { required: 'Required' })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Visit Date" name="date" type="date" register={register} {...register('date')} />
                <FormInput label="Treated By" name="doctorName" register={register} placeholder="Doctor or nurse name" />
              </div>
              <FormInput label="Symptoms (comma separated)" name="symptoms" register={register} required error={errors.symptoms} placeholder="Fever, Cough, Headache" {...register('symptoms', { required: 'Required' })} />
              <FormInput label="Diagnosis" name="diagnosis" register={register} required error={errors.diagnosis} {...register('diagnosis', { required: 'Required' })} />
              <FormInput label="Medications (comma separated)" name="medications" register={register} placeholder="Acetaminophen 500mg" />
              <FormTextarea label="Doctor Notes" name="doctorNotes" register={register} placeholder="Additional notes..." />
              <button type="submit" disabled={loading || students.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl gradient-health py-3 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? <LoadingSpinner size="sm" /> : 'Create Record'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateMedicalRecord;
