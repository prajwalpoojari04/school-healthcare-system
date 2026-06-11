import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiHash, FiMail, FiPhone, FiMapPin,
  FiCalendar, FiShield, FiSave, FiArrowLeft,
  FiChevronDown, FiAlertCircle,
} from 'react-icons/fi';
import { studentService } from '../../services/studentService';

// ─── Options ───────────────────────────────────────────────────────────────
const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12',
];

const BLOOD_GROUP_OPTIONS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// ─── Design tokens (Guardian Grid palette) ─────────────────────────────────
const C = {
  sky:    '#0ea5e9',
  teal:   '#14b8a6',
  border: 'rgba(51,65,85,0.6)',
  glass:  'rgba(15,23,42,0.55)',
};

// ─── Animation variants ────────────────────────────────────────────────────
const pageVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden:  { opacity: 0, y: 18, filter: 'blur(5px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 140, damping: 16 },
  },
};

// ─── Section card wrapper ──────────────────────────────────────────────────
const FormSection = ({ title, icon: Icon, accentColor = C.sky, children }) => (
  <motion.div
    className="relative overflow-hidden rounded-2xl"
    style={{
      background: C.glass,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${C.border}`,
      boxShadow: '0 4px 24px rgba(3,7,18,0.4)',
    }}
    variants={sectionVariants}
  >
    {/* Top accent bar */}
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }}
    />
    {/* Blueprint micro-grid */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    />
    <div className="relative p-6">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={13} color={accentColor} />
        </div>
        <h3 className="font-mono text-xs font-bold tracking-widest text-white uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  </motion.div>
);

// ─── Glow input field ──────────────────────────────────────────────────────
const GlowField = ({ label, icon: Icon, error, isFocused, required, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
      {label}
      {required && <span style={{ color: C.sky }}>*</span>}
    </label>
    {/* Stripe border-layering trick */}
    <div
      className="relative rounded-lg p-px transition-all duration-300"
      style={{
        background: isFocused
          ? `linear-gradient(135deg, ${C.sky}, ${C.teal})`
          : C.border,
      }}
    >
      <div className="relative flex items-center rounded-[7px] bg-slate-900/90">
        {Icon && (
          <span className="pointer-events-none absolute left-3 text-slate-500 flex-shrink-0">
            <Icon size={13} />
          </span>
        )}
        {children}
        {/* Focus underline */}
        <motion.div
          className="pointer-events-none absolute bottom-0 left-0 h-px rounded-full"
          style={{ background: `linear-gradient(90deg, ${C.sky}, ${C.teal})` }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 15 }}
        />
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          className="flex items-center gap-1 font-mono text-[10px] text-red-400"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <FiAlertCircle size={10} />
          {error.message}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// ─── Shared input class ─────────────────────────────────────────────────────
const inputCls = (hasIcon = true) =>
  `w-full rounded-[7px] bg-transparent py-2.5 ${hasIcon ? 'pl-9' : 'pl-3'} pr-3 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none`;

const selectCls = (hasIcon = true) =>
  `w-full cursor-pointer appearance-none rounded-[7px] bg-transparent py-2.5 ${hasIcon ? 'pl-9' : 'pl-3'} pr-8 font-mono text-xs text-slate-100 outline-none`;

// ══════════════════════════════════════════════════════════════════════════
// ADD STUDENT
// ══════════════════════════════════════════════════════════════════════════
const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // ── Cursor spotlight on submit card ────────────────────────────────────
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX  = useTransform(mouseX, (v) => `${v}px`);
  const spotY  = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  // ── Submit — payload keys match backend schema exactly ─────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Build payload with exact backend field names.
      // FIX 1: studentId  → admissionNumber
      // FIX 2: bloodType  → bloodGroup
      // FIX 3: grade is now included (was entirely missing)
      const payload = {
        admissionNumber:       data.admissionNumber,
        firstName:             data.firstName,
        lastName:              data.lastName,
        dateOfBirth:           data.dateOfBirth,
        gender:                data.gender,
        grade:                 data.grade,                 // ← FIX 3: required field
        bloodGroup:            data.bloodGroup,            // ← FIX 2: was bloodType
        height:                data.height ? Number(data.height) : undefined,
        weight:                data.weight ? Number(data.weight) : undefined,
        allergies:             data.allergies ? data.allergies.split(',').map(item => item.trim()) : [],
        medicalConditions:     data.medicalConditions ? data.medicalConditions.split(',').map(item => item.trim()) : [],
        emergencyContactName:  data.emergencyContactName,
        emergencyContactNumber:data.emergencyContactNumber,
        parentEmail:           data.parentEmail,
        address:               data.address,
      };

      await studentService.create(payload);
      toast.success('Student enrolled successfully!');
      navigate('/students');
    } catch (err) {
      toast.error(err.message || 'Failed to enroll student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const focus   = (name) => () => setFocusedField(name);
  const unfocus = ()     => setFocusedField(null);

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif" }}
    >
      <motion.div
        className="mx-auto max-w-4xl space-y-5"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >

        {/* ── Page header ── */}
        <motion.div
          className="flex items-center justify-between"
          variants={sectionVariants}
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/students')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400"
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: `1px solid ${C.border}`,
              }}
              whileHover={{ y: -1, color: '#e2e8f0', borderColor: `${C.sky}40` }}
              whileTap={{ scale: 0.93, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            >
              <FiArrowLeft size={15} />
            </motion.button>
            <div>
              <div className="flex items-center gap-2">
                <FiShield size={12} color="rgba(14,165,233,0.5)" />
                <span className="font-mono text-[9px] tracking-[0.3em] text-slate-600 uppercase">
                  Student Registry
                </span>
              </div>
              <h1 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
                Enroll New Student
              </h1>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── SECTION 1: Identity ── */}
          <FormSection title="Identity & Admission" icon={FiHash} accentColor={C.sky}>
            <div className="grid gap-4 sm:grid-cols-3">

              {/* admissionNumber — FIX 1: was studentId */}
              <GlowField
                label="Admission Number"
                icon={FiHash}
                error={errors.admissionNumber}
                isFocused={focusedField === 'admissionNumber'}
                required
              >
                <input
                  placeholder="ADM-2024-001"
                  className={inputCls()}
                  onFocus={focus('admissionNumber')}
                  onBlur={unfocus}
                  {...register('admissionNumber', { required: 'Admission number is required' })}
                />
              </GlowField>

              {/* firstName */}
              <GlowField
                label="First Name"
                icon={FiUser}
                error={errors.firstName}
                isFocused={focusedField === 'firstName'}
                required
              >
                <input
                  placeholder="Jane"
                  className={inputCls()}
                  onFocus={focus('firstName')}
                  onBlur={unfocus}
                  {...register('firstName', { required: 'First name is required' })}
                />
              </GlowField>

              {/* lastName */}
              <GlowField
                label="Last Name"
                icon={FiUser}
                error={errors.lastName}
                isFocused={focusedField === 'lastName'}
                required
              >
                <input
                  placeholder="Doe"
                  className={inputCls()}
                  onFocus={focus('lastName')}
                  onBlur={unfocus}
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </GlowField>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">

              {/* dateOfBirth */}
              <GlowField
                label="Date of Birth"
                icon={FiCalendar}
                error={errors.dateOfBirth}
                isFocused={focusedField === 'dateOfBirth'}
                required
              >
                <input
                  type="date"
                  className={inputCls()}
                  style={{ colorScheme: 'dark' }}
                  onFocus={focus('dateOfBirth')}
                  onBlur={unfocus}
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                />
              </GlowField>

              {/* gender */}
              <GlowField
                label="Gender"
                icon={FiUser}
                error={errors.gender}
                isFocused={focusedField === 'gender'}
                required
              >
                <select
                  className={selectCls()}
                  style={{ colorScheme: 'dark' }}
                  defaultValue=""
                  onFocus={focus('gender')}
                  onBlur={unfocus}
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-slate-100">{g}</option>
                  ))}
                </select>
                <FiChevronDown size={11} className="pointer-events-none absolute right-3 text-slate-500" />
              </GlowField>

              {/* grade — FIX 3: entirely new required field */}
              <GlowField
                label="Grade"
                icon={FiHash}
                error={errors.grade}
                isFocused={focusedField === 'grade'}
                required
              >
                <select
                  className={selectCls()}
                  style={{ colorScheme: 'dark' }}
                  defaultValue=""
                  onFocus={focus('grade')}
                  onBlur={unfocus}
                  {...register('grade', { required: 'Grade is required' })}
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">Select grade</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-slate-100">{g}</option>
                  ))}
                </select>
                <FiChevronDown size={11} className="pointer-events-none absolute right-3 text-slate-500" />
              </GlowField>
            </div>
          </FormSection>

          {/* ── SECTION 2: Medical Profile ── */}
          <FormSection title="Medical Profile" icon={FiShield} accentColor={C.teal}>
            <div className="grid gap-4 sm:grid-cols-3">

              {/* bloodGroup — FIX 2: was bloodType */}
              <GlowField
                label="Blood Group"
                icon={FiShield}
                error={errors.bloodGroup}
                isFocused={focusedField === 'bloodGroup'}
              >
                <select
                  className={selectCls()}
                  style={{ colorScheme: 'dark' }}
                  defaultValue=""
                  onFocus={focus('bloodGroup')}
                  onBlur={unfocus}
                  {...register('bloodGroup')}
                >
                  <option value="" className="bg-slate-900 text-slate-500">Select blood group</option>
                  {BLOOD_GROUP_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-slate-900 text-slate-100">{b}</option>
                  ))}
                </select>
                <FiChevronDown size={11} className="pointer-events-none absolute right-3 text-slate-500" />
              </GlowField>

              {/* height */}
              <GlowField
                label="Height (cm)"
                icon={FiUser}
                error={errors.height}
                isFocused={focusedField === 'height'}
              >
                <input
                  type="number"
                  placeholder="155"
                  min="50"
                  max="250"
                  className={inputCls()}
                  onFocus={focus('height')}
                  onBlur={unfocus}
                  {...register('height', {
                    min: { value: 50,  message: 'Minimum 50 cm'  },
                    max: { value: 250, message: 'Maximum 250 cm' },
                  })}
                />
              </GlowField>

              {/* weight */}
              <GlowField
                label="Weight (kg)"
                icon={FiUser}
                error={errors.weight}
                isFocused={focusedField === 'weight'}
              >
                <input
                  type="number"
                  placeholder="50"
                  min="10"
                  max="200"
                  className={inputCls()}
                  onFocus={focus('weight')}
                  onBlur={unfocus}
                  {...register('weight', {
                    min: { value: 10,  message: 'Minimum 10 kg'  },
                    max: { value: 200, message: 'Maximum 200 kg' },
                  })}
                />
              </GlowField>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              {/* allergies */}
              <GlowField
                label="Allergies"
                icon={FiAlertCircle}
                error={errors.allergies}
                isFocused={focusedField === 'allergies'}
              >
                <input
                  placeholder="Peanuts, Penicillin…"
                  className={inputCls()}
                  onFocus={focus('allergies')}
                  onBlur={unfocus}
                  {...register('allergies')}
                />
              </GlowField>

              {/* medicalConditions */}
              <GlowField
                label="Medical Conditions"
                icon={FiAlertCircle}
                error={errors.medicalConditions}
                isFocused={focusedField === 'medicalConditions'}
              >
                <input
                  placeholder="Asthma, Diabetes…"
                  className={inputCls()}
                  onFocus={focus('medicalConditions')}
                  onBlur={unfocus}
                  {...register('medicalConditions')}
                />
              </GlowField>
            </div>
          </FormSection>

          {/* ── SECTION 3: Contact & Guardian ── */}
          <FormSection title="Contact & Guardian" icon={FiPhone} accentColor="#8b5cf6">
            <div className="grid gap-4 sm:grid-cols-2">

              {/* emergencyContactName */}
              <GlowField
                label="Emergency Contact Name"
                icon={FiUser}
                error={errors.emergencyContactName}
                isFocused={focusedField === 'emergencyContactName'}
                required
              >
                <input
                  placeholder="John Doe"
                  className={inputCls()}
                  onFocus={focus('emergencyContactName')}
                  onBlur={unfocus}
                  {...register('emergencyContactName', { required: 'Emergency contact name is required' })}
                />
              </GlowField>

              {/* emergencyContactNumber */}
              <GlowField
                label="Emergency Contact Number"
                icon={FiPhone}
                error={errors.emergencyContactNumber}
                isFocused={focusedField === 'emergencyContactNumber'}
                required
              >
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  className={inputCls()}
                  onFocus={focus('emergencyContactNumber')}
                  onBlur={unfocus}
                  {...register('emergencyContactNumber', { required: 'Emergency contact number is required' })}
                />
              </GlowField>

              {/* parentEmail */}
              <GlowField
                label="Parent / Guardian Email"
                icon={FiMail}
                error={errors.parentEmail}
                isFocused={focusedField === 'parentEmail'}
                required
              >
                <input
                  type="email"
                  placeholder="parent@school.edu"
                  className={inputCls()}
                  onFocus={focus('parentEmail')}
                  onBlur={unfocus}
                  {...register('parentEmail', {
                    required: 'Parent email is required',
                    pattern:  { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                />
              </GlowField>

              {/* address */}
              <GlowField
                label="Home Address"
                icon={FiMapPin}
                error={errors.address}
                isFocused={focusedField === 'address'}
              >
                <input
                  placeholder="123 Campus Lane, City"
                  className={inputCls()}
                  onFocus={focus('address')}
                  onBlur={unfocus}
                  {...register('address')}
                />
              </GlowField>
            </div>
          </FormSection>

          {/* ── Submit card ── */}
          <motion.div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: C.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${C.border}`,
            }}
            variants={sectionVariants}
            onMouseMove={handleMouseMove}
          >
            {/* Cursor spotlight */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-2xl"
              style={{
                background: `radial-gradient(260px circle at ${spotX} ${spotY}, rgba(14,165,233,0.07), transparent 70%)`,
              }}
            />
            <div className="relative flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                All required fields must be completed before enrollment.
              </p>
              <div className="flex gap-3">
                {/* Cancel */}
                <motion.button
                  type="button"
                  onClick={() => navigate('/students')}
                  className="rounded-xl px-5 py-2.5 font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase"
                  style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${C.border}` }}
                  whileHover={{ borderColor: 'rgba(100,116,139,0.6)', color: '#94a3b8' }}
                  whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                >
                  Cancel
                </motion.button>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 font-mono text-xs font-bold tracking-widest text-white uppercase disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, #0369a1, ${C.sky} 50%, ${C.teal})`,
                    boxShadow: `0 4px 20px rgba(14,165,233,0.35)`,
                    willChange: 'transform',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(14,165,233,0.5)' }}
                  whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <FiSave size={13} />
                    )}
                    {loading ? 'Enrolling…' : 'Enroll Student'}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

        </form>
      </motion.div>
    </div>
  );
};

export default AddStudent;
