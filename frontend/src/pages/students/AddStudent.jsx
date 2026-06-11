import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { studentService } from '../../services/studentService';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const student = await studentService.create({
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map((a) => a.trim()) : [],
        medicalConditions: data.medicalConditions ? data.medicalConditions.split(',').map((c) => c.trim()) : [],
        emergencyContactName: data.emergencyName,
        emergencyContactNumber: data.emergencyPhone,
      });
      toast.success('Student added successfully');
      navigate(`/students/${student.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-health-600">
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="glass-card">
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Add New Student</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="First Name" name="firstName" register={register} required error={errors.firstName} {...register('firstName', { required: 'Required' })} />
              <FormInput label="Last Name" name="lastName" register={register} required error={errors.lastName} {...register('lastName', { required: 'Required' })} />
              <FormInput label="Admission Number" name="studentId" register={register} required error={errors.studentId} {...register('studentId', { required: 'Required' })} />
              <FormInput label="Date of Birth" name="dateOfBirth" type="date" register={register} required error={errors.dateOfBirth} {...register('dateOfBirth', { required: 'Required' })} />
              <FormSelect label="Gender" name="gender" register={register} required error={errors.gender} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} {...register('gender', { required: 'Required' })} />
              <FormSelect label="Blood Type" name="bloodType" register={register} required error={errors.bloodType} options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({ value: b, label: b }))} {...register('bloodType', { required: 'Required' })} />
              <FormInput label="Parent Email" name="parentEmail" type="email" register={register} placeholder="parent@email.com" />
              <FormInput label="Address" name="address" register={register} />
            </div>
            <FormInput label="Allergies (comma separated)" name="allergies" register={register} placeholder="Peanuts, Penicillin" />
            <FormInput label="Medical Conditions (comma separated)" name="medicalConditions" register={register} placeholder="Asthma, Diabetes" />
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Emergency Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Name" name="emergencyName" register={register} required error={errors.emergencyName} {...register('emergencyName', { required: 'Required' })} />
                <FormInput label="Phone" name="emergencyPhone" register={register} required error={errors.emergencyPhone} {...register('emergencyPhone', { required: 'Required' })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl gradient-health py-3 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? <LoadingSpinner size="sm" /> : 'Add Student'}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default AddStudent;
