import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/forms/FormInput';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);
      toast.success(response.message);
      setSent(true);
    } catch {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a link to reset your password">
      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-health-100 dark:bg-health-900/30">
            <span className="text-2xl">✉️</span>
          </div>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            Check your email for a password reset link. If you don't see it, check your spam folder.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-health-600 hover:text-health-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@school.edu"
            register={register}
            required
            error={errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
            })}
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl gradient-health py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-health-600"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
