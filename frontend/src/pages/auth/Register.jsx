import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiShield, FiChevronDown } from 'react-icons/fi';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_ROUTES } from '../../utils/helpers';

// ─── Animation Variants ────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, x: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { cubicBezier: [0.16, 1, 0.3, 1], duration: 0.8, delay: 0.2 },
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const charVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 140, damping: 15, mass: 0.7 },
  },
};

const panelVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { cubicBezier: [0.16, 1, 0.3, 1], duration: 0.9 },
  },
};

// ─── Staggered Character Text ───────────────────────────────────────────────
const StaggerText = ({ text, className, delay = 0 }) => (
  <motion.span
    className={className}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0 0.01em' }}
    transition={{ delayChildren: delay }}
  >
    {text.split('').map((char, i) => (
      <motion.span key={i} variants={charVariants} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
        {char}
      </motion.span>
    ))}
  </motion.span>
);

// ─── Left Panel ─────────────────────────────────────────────────────────────
const RegisterCanvas = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-10">
    {/* Blueprint grid */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 50% 45%, rgba(14,165,233,0.10) 0%, transparent 68%)',
      }}
    />

    {/* Particles */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${4 + (i % 4) * 2}px`,
          height: `${4 + (i % 4) * 2}px`,
          left: `${10 + (i * 7.1) % 80}%`,
          top: `${15 + (i * 6.3) % 70}%`,
          background: i % 2 === 0 ? 'rgba(14,165,233,0.7)' : 'rgba(20,184,166,0.6)',
          boxShadow: i % 2 === 0 ? '0 0 8px 2px rgba(14,165,233,0.5)' : '0 0 8px 2px rgba(20,184,166,0.4)',
        }}
        animate={{ y: [0, -15, 0, 10, 0], opacity: [0.4, 0.85, 0.5, 0.8, 0.4] }}
        transition={{ duration: 4 + (i % 3) * 1.2, delay: i * 0.25, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}

    {/* Concentric shield rings */}
    <div className="relative mb-8 flex items-center justify-center">
      {[80, 60, 44].map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full border border-sky-500/20"
          style={{ width: size, height: size }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-xl"
        style={{
          background: 'rgba(14,165,233,0.10)',
          border: '1px solid rgba(14,165,233,0.3)',
          boxShadow: '0 0 30px rgba(14,165,233,0.15)',
        }}
      >
        <FiShield size={26} color="#0ea5e9" />
      </div>
    </div>

    <h1 className="text-center text-3xl font-bold text-white">
      <StaggerText text="Join the Grid" delay={0.5} />
    </h1>
    <p className="mt-3 text-center text-sm leading-relaxed text-slate-400">
      <StaggerText text="Register your role and" className="block" delay={0.9} />
      <StaggerText text="secure your access node." className="block" delay={1.2} />
    </p>

    <motion.div
      className="mt-6 flex items-center gap-3 font-mono text-xs text-slate-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.6 }}
    >
      {[
        { label: 'ENCRYPTED', color: '#10b981' },
        { label: 'VERIFIED', color: '#0ea5e9' },
      ].map(({ label, color }) => (
        <span key={label} className="flex items-center gap-1.5">
          <motion.span
            className="block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 5px 1px ${color}` }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {label}
        </span>
      ))}
    </motion.div>
  </div>
);

// ─── Glow Input ──────────────────────────────────────────────────────────────
const GlowInput = ({ label, icon: Icon, error, children, isFocused }) => (
  <div className="space-y-1.5">
    <label className="block font-mono text-xs font-medium uppercase tracking-widest text-slate-400">
      {label}
    </label>
    <div
      className="relative rounded-lg p-px transition-all duration-300"
      style={{
        background: isFocused
          ? 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
          : 'rgba(51,65,85,0.6)',
      }}
    >
      <div className="relative flex items-center rounded-[7px] bg-slate-900/90">
        {Icon && (
          <span className="pointer-events-none absolute left-3 text-slate-500">
            <Icon size={14} />
          </span>
        )}
        {children}
        <motion.div
          className="pointer-events-none absolute bottom-0 left-0 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, #0ea5e9, #14b8a6)' }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 15, mass: 0.7 }}
        />
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          className="font-mono text-xs text-red-400"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          ⚠ {error.message}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Register Component ─────────────────────────────────────────────────
const Register = () => {
  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────────
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await registerUser(data);
      toast.success('Account created successfully!');
      navigate(ROLE_ROUTES[response.user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const [focusedField, setFocusedField] = useState(null);

  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightX = useTransform(mouseX, (v) => `${v}px`);
  const spotlightY = useTransform(mouseY, (v) => `${v}px`);

  const roleOptions = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Parent', label: 'Parent' },
  ];

  const fieldDelays = [0.7, 0.78, 0.86, 0.94, 1.02];

  return (
    <div
      className="relative flex min-h-screen overflow-hidden bg-[#050B1A]"
      style={{ fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif" }}
    >
      {/* Global glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.05) 0%, transparent 70%)',
        }}
      />

      {/* ── LEFT: Register Canvas ── */}
      <motion.div
        className="relative hidden flex-col lg:flex lg:w-1/2"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.15) 30%, rgba(14,165,233,0.15) 70%, transparent)',
          }}
        />
        <RegisterCanvas />
      </motion.div>

      {/* ── RIGHT: Terminal Card ── */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <motion.div
          ref={cardRef}
          className="relative w-full max-w-md overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(51,65,85,0.8)',
            boxShadow: '0 4px 20px -2px rgba(3,7,18,0.5), 0 12px 40px -8px rgba(14,165,233,0.12)',
            willChange: 'transform, opacity',
          }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          onMouseMove={handleMouseMove}
        >
          {/* Cursor spotlight */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-2xl"
            style={{
              background: `radial-gradient(320px circle at ${spotlightX} ${spotlightY}, rgba(14,165,233,0.07), transparent 70%)`,
            }}
          />

          {/* Top accent bar */}
          <div
            className="h-px w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #0ea5e9 40%, #14b8a6 60%, transparent)',
            }}
          />

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <motion.div
                className="mb-4 flex items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: 'rgba(14,165,233,0.1)',
                    border: '1px solid rgba(14,165,233,0.25)',
                  }}
                >
                  <FiShield size={14} color="#0ea5e9" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-sky-400/70">
                  Guardian Grid
                </span>
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Create Account
              </motion.h2>
              <motion.p
                className="mt-1 font-mono text-xs text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
              >
                Register to access the healthcare system
              </motion.p>
            </div>

            {/* ── FORM — ALL ORIGINAL LOGIC PRESERVED ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Full Name */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fieldDelays[0], type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput label="Full Name" icon={FiUser} error={errors.name} isFocused={focusedField === 'name'}>
                  <input
                    placeholder="John Doe"
                    className="w-full rounded-[7px] bg-transparent py-3 pl-9 pr-4 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    {...register('name', { required: 'Name is required' })}
                  />
                </GlowInput>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fieldDelays[1], type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput label="Email Address" icon={FiMail} error={errors.email} isFocused={focusedField === 'email'}>
                  <input
                    type="email"
                    placeholder="you@school.edu"
                    className="w-full rounded-[7px] bg-transparent py-3 pl-9 pr-4 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                    })}
                  />
                </GlowInput>
              </motion.div>

              {/* Role Select */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fieldDelays[2], type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput label="Role" icon={FiShield} error={errors.role} isFocused={focusedField === 'role'}>
                  <select
                    className="w-full cursor-pointer appearance-none rounded-[7px] bg-transparent py-3 pl-9 pr-8 font-mono text-sm text-slate-100 outline-none"
                    onFocus={() => setFocusedField('role')}
                    onBlur={() => setFocusedField(null)}
                    defaultValue=""
                    {...register('role', { required: 'Role is required' })}
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-500">
                      Select your role
                    </option>
                    {roleOptions.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-slate-900 text-slate-100">
                        {label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown size={12} className="pointer-events-none absolute right-3 text-slate-500" />
                </GlowInput>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fieldDelays[3], type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput label="Password" icon={FiLock} error={errors.password} isFocused={focusedField === 'password'}>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-[7px] bg-transparent py-3 pl-9 pr-4 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                </GlowInput>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fieldDelays[4], type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput label="Confirm Password" icon={FiLock} error={errors.confirmPassword} isFocused={focusedField === 'confirmPassword'}>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full rounded-[7px] bg-transparent py-3 pl-9 pr-4 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none"
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (val) => val === watch('password') || 'Passwords do not match',
                    })}
                  />
                </GlowInput>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.12, duration: 0.4 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl py-3 font-mono text-sm font-semibold text-white disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #14b8a6 100%)',
                    boxShadow: '0 4px 20px -2px rgba(14,165,233,0.35)',
                    willChange: 'transform',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 8px 30px -4px rgba(14,165,233,0.5)' }}
                  whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <FiShield size={14} />
                        Create Account
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>

              <motion.p
                className="text-center font-mono text-xs text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                Already have an account?{' '}
                <Link to="/login" className="text-sky-500 transition-colors hover:text-sky-300">
                  Sign in
                </Link>
              </motion.p>
            </form>
          </div>

          {/* Bottom status bar */}
          <motion.div
            className="border-t border-slate-800/60 px-8 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-600">
              <span>SYS·HEALTH·OS</span>
              <span className="flex items-center gap-1.5">
                <motion.span
                  className="block h-1.5 w-1.5 rounded-full bg-emerald-400"
                  style={{ boxShadow: '0 0 5px rgba(16,185,129,0.7)' }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                REGISTRATION OPEN
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
