import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { studentService } from '../../services/studentService';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchStudent = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const student = await studentService.getById(id);
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        gender: student.gender,
        bloodType: student.bloodType,
        parentEmail: student.parentEmail || '',
        address: student.address || '',
        allergies: student.allergies?.join(', '),
        medicalConditions: student.medicalConditions?.join(', '),
        emergencyName: student.emergencyContacts?.[0]?.name || student.emergencyContactName,
        emergencyPhone: student.emergencyContacts?.[0]?.phone || student.emergencyContactNumber,
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setFetching(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await studentService.update(id, {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map((a) => a.trim()) : [],
        medicalConditions: data.medicalConditions ? data.medicalConditions.split(',').map((c) => c.trim()) : [],
        emergencyContactName: data.emergencyName,
        emergencyContactNumber: data.emergencyPhone,
      });
      toast.success('Student updated successfully');
      navigate(`/students/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchStudent} />;

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => navigate(`/students/${id}`)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-health-600">
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="glass-card">
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Edit Student</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="First Name" name="firstName" register={register} required error={errors.firstName} {...register('firstName', { required: 'Required' })} />
              <FormInput label="Last Name" name="lastName" register={register} required error={errors.lastName} {...register('lastName', { required: 'Required' })} />
              <FormInput label="Admission Number" name="studentId" register={register} required error={errors.studentId} {...register('studentId', { required: 'Required' })} />
              <FormInput label="Date of Birth" name="dateOfBirth" type="date" register={register} required error={errors.dateOfBirth} {...register('dateOfBirth', { required: 'Required' })} />
              <FormSelect label="Gender" name="gender" register={register} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
              <FormSelect label="Blood Type" name="bloodType" register={register} options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({ value: b, label: b }))} />
              <FormInput label="Parent Email" name="parentEmail" type="email" register={register} />
              <FormInput label="Address" name="address" register={register} />
            </div>
            <FormInput label="Allergies" name="allergies" register={register} />
            <FormInput label="Medical Conditions" name="medicalConditions" register={register} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Emergency Name" name="emergencyName" register={register} />
              <FormInput label="Phone" name="emergencyPhone" register={register} />
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl gradient-health py-3 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default EditStudent;
