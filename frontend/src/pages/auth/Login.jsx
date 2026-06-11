import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiShield } from 'react-icons/fi';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_ROUTES } from '../../utils/helpers';

// ─── Animation Variants ────────────────────────────────────────────────────
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

const cardVariants = {
  hidden: { opacity: 0, x: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { cubicBezier: [0.16, 1, 0.3, 1], duration: 0.8, delay: 0.2 },
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

// ─── ECG → Shield SVG Canvas ────────────────────────────────────────────────
const GuardianCanvas = () => {
  // ECG path with a shield morph section
  const ecgPath =
    'M0,60 L60,60 L75,60 L85,20 L95,100 L105,10 L115,85 L125,60 L145,60 L160,60 L175,40 L185,80 L195,60 L240,60';

  const shieldPath =
    'M120,10 L160,25 L160,65 Q160,90 120,105 Q80,90 80,65 L80,25 Z';

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Blueprint grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Orbital radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.10) 0%, transparent 68%)',
        }}
      />

      {/* Floating bio-luminescent particles */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            left: `${10 + (i * 6.2) % 80}%`,
            top: `${15 + (i * 7.1) % 70}%`,
            background:
              i % 3 === 0
                ? 'rgba(14,165,233,0.7)'
                : i % 3 === 1
                ? 'rgba(20,184,166,0.6)'
                : 'rgba(16,185,129,0.5)',
            boxShadow:
              i % 3 === 0
                ? '0 0 8px 2px rgba(14,165,233,0.5)'
                : i % 3 === 1
                ? '0 0 8px 2px rgba(20,184,166,0.4)'
                : '0 0 8px 2px rgba(16,185,129,0.4)',
          }}
          animate={{
            y: [0, -18, 0, 12, 0],
            x: [0, 10, -6, 4, 0],
            opacity: [0.4, 0.9, 0.5, 0.8, 0.4],
            scale: [1, 1.3, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 4 + (i % 3) * 1.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main SVG animation canvas */}
      <svg
        viewBox="0 0 240 120"
        className="relative z-10 w-full max-w-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="40%" stopColor="#0ea5e9" stopOpacity="1" />
            <stop offset="70%" stopColor="#14b8a6" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ECG baseline glow trail */}
        <motion.path
          d={ecgPath}
          stroke="url(#ecgGrad)"
          strokeWidth="1.5"
          filter="url(#glow)"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.45, 0.75, 1] }}
        />

        {/* ECG primary line */}
        <motion.path
          d={ecgPath}
          stroke="#0ea5e9"
          strokeWidth="2"
          filter="url(#glow)"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.45, 0.75, 1], delay: 0.05 }}
        />

        {/* Shield morph — fades in as ECG fades out */}
        <motion.path
          d={shieldPath}
          stroke="#0ea5e9"
          strokeWidth="2"
          fill="rgba(14,165,233,0.06)"
          filter="url(#glow)"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: [0, 0, 0.9, 0.9, 0], scale: [0.85, 0.85, 1, 1, 0.85] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.55, 0.7, 0.85, 1] }}
          style={{ originX: '120px', originY: '57px' }}
        />

        {/* Shield inner cross */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.6, 0.72, 0.83, 1] }}
        >
          <line x1="120" y1="42" x2="120" y2="72" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
          <line x1="105" y1="57" x2="135" y2="57" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
        </motion.g>

        {/* Pulse dot that travels the ECG */}
        <motion.circle
          r="3"
          fill="#0ea5e9"
          filter="url(#glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.05, 0.44, 0.5] }}
        >
          <animateMotion dur="1.575s" repeatCount="indefinite" path={ecgPath} />
        </motion.circle>
      </svg>

      {/* Hero text stagger block */}
      <div className="absolute bottom-16 left-0 right-0 px-10 text-center">
        <motion.div
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-sky-400/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Campus Health OS · v4.1
        </motion.div>

        <h1 className="text-3xl font-bold leading-tight text-white">
          <StaggerText text="Guardian Grid" className="block" delay={0.7} />
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          <StaggerText text="AI-Powered School Healthcare" className="block" delay={1.1} />
          <StaggerText text="Rescue Command Center" className="block" delay={1.4} />
        </p>

        {/* Status bar */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-3 font-mono text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {[
            { label: 'SECURE', color: '#10b981' },
            { label: 'LIVE', color: '#0ea5e9' },
            { label: 'HIPAA', color: '#14b8a6' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5">
              <motion.span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 6px 1px ${color}` }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
              />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ─── Glowing Focus Input ────────────────────────────────────────────────────
const GlowInput = ({ label, icon: Icon, error, children, isFocused }) => (
  <div className="space-y-1.5">
    <label className="block font-mono text-xs font-medium uppercase tracking-widest text-slate-400">
      {label}
    </label>
    {/* Stripe border layering trick */}
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
        {/* Animated focus underline */}
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

// ─── Main Login Component ───────────────────────────────────────────────────
const Login = () => {
  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────────
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(
        { email: data.email, password: data.password },
        data.rememberMe
      );
      toast.success('Welcome back!');
      
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Focus state tracking for glow inputs
  const [focusedField, setFocusedField] = useState(null);

  // Card cursor spotlight
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

  return (
    <div
      className="relative flex min-h-screen overflow-hidden bg-[#050B1A]"
      style={{ fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif" }}
    >
      {/* Global background radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.05) 0%, transparent 70%)',
        }}
      />

      {/* ── LEFT: Guardian Canvas ── */}
      <motion.div
        className="relative hidden flex-col lg:flex lg:w-1/2"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Vertical separator */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-px"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(14,165,233,0.15) 30%, rgba(14,165,233,0.15) 70%, transparent)',
          }}
        />
        <GuardianCanvas />
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
            boxShadow:
              '0 4px 20px -2px rgba(3,7,18,0.5), 0 12px 40px -8px rgba(14,165,233,0.12)',
            willChange: 'transform, opacity',
          }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          onMouseMove={handleMouseMove}
        >
          {/* Cursor spotlight */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(320px circle at ${spotlightX} ${spotlightY}, rgba(14,165,233,0.07), transparent 70%)`,
              opacity: 1,
            }}
          />

          {/* Top accent bar */}
          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, #0ea5e9 40%, #14b8a6 60%, transparent)',
            }}
          />

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
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
                <span className="font-mono text-xs tracking-widest text-sky-400/70 uppercase">
                  Guardian Grid
                </span>
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Sign In
              </motion.h2>
              <motion.p
                className="mt-1 font-mono text-xs text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
              >
                Enter your credentials to access the system
              </motion.p>
            </div>

            {/* ── FORM — ALL ORIGINAL LOGIC PRESERVED ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput
                  label="Email Address"
                  icon={FiMail}
                  error={errors.email}
                  isFocused={focusedField === 'email'}
                >
                  <input
                    type="email"
                    placeholder="you@school.edu"
                    className="w-full rounded-[7px] bg-transparent py-3 pl-9 pr-4 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                  />
                </GlowInput>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 140, damping: 15 }}
              >
                <GlowInput
                  label="Password"
                  icon={FiLock}
                  error={errors.password}
                  isFocused={focusedField === 'password'}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full rounded-[7px] bg-transparent py-3 pl-9 pr-10 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-500 transition-colors hover:text-slate-300"
                  >
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </GlowInput>
              </motion.div>

              {/* Remember me + Forgot password */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-slate-500">
                  <div className="relative">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-700 bg-slate-900 checked:border-sky-500 checked:bg-sky-500/20"
                    />
                    <motion.div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center text-sky-400 opacity-0 peer-checked:opacity-100"
                      style={{ fontSize: '9px' }}
                    >
                      ✓
                    </motion.div>
                  </div>
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="font-mono text-xs text-sky-500 transition-colors hover:text-sky-300"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
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
                  {/* Shimmer sweep */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
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
                        Sign In
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>

              <motion.p
                className="text-center font-mono text-xs text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-sky-500 transition-colors hover:text-sky-300"
                >
                  Create account
                </Link>
              </motion.p>
            </form>
          </div>

          {/* Bottom monospace status bar */}
          <motion.div
            className="border-t border-slate-800/60 px-8 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
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
                ALL SYSTEMS NOMINAL
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
