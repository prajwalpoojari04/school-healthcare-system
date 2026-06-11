import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import {
  FiShield, FiActivity, FiTerminal, FiLogIn,
  FiUsers, FiAlertCircle, FiCpu, FiZap,
  FiLock, FiRadio, FiDatabase,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  sky:     '#0ea5e9',
  teal:    '#14b8a6',
  emerald: '#10b981',
  crimson: '#ef4444',
  amber:   '#f97316',
  violet:  '#8b5cf6',
  navy:    '#050B1A',
};

// ══════════════════════════════════════════════════════════════════════════
// PARTICLE FIELD
// ══════════════════════════════════════════════════════════════════════════
const PARTICLE_COUNT = 52;

const ParticleField = () => {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x:    Math.random() * 100,
      y:    Math.random() * 100,
      size: 1.5 + Math.random() * 3,
      dur:  6 + Math.random() * 10,
      delay: Math.random() * 8,
      color: [C.sky, C.teal, C.emerald, C.violet, C.amber][i % 5],
      dx:  (Math.random() - 0.5) * 30,
      dy:  (Math.random() - 0.5) * 30,
    })), []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}55`,
          }}
          animate={{
            x:       [0, p.dx, -p.dx * 0.6, 0],
            y:       [0, p.dy, -p.dy * 0.4, 0],
            opacity: [0.15, 0.85, 0.4, 0.15],
            scale:   [1, 1.6, 0.8, 1],
          }}
          transition={{
            duration:   p.dur,
            delay:      p.delay,
            repeat:     Infinity,
            ease:       'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ANIMATED GRID
// ══════════════════════════════════════════════════════════════════════════
const AnimatedGrid = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Static fine grid */}
    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage: `
          linear-gradient(${C.sky} 1px, transparent 1px),
          linear-gradient(90deg, ${C.sky} 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }}
    />
    {/* Coarse accent grid */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(${C.teal} 1px, transparent 1px),
          linear-gradient(90deg, ${C.teal} 1px, transparent 1px)
        `,
        backgroundSize: '192px 192px',
      }}
    />
    {/* Sweeping horizontal scan line */}
    <motion.div
      className="absolute left-0 right-0 h-px"
      style={{
        background: `linear-gradient(90deg, transparent, ${C.sky}60, ${C.teal}60, transparent)`,
        boxShadow: `0 0 12px 2px ${C.sky}30`,
      }}
      animate={{ top: ['-2%', '102%'] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
    />
    {/* Sweeping vertical scan line */}
    <motion.div
      className="absolute top-0 bottom-0 w-px"
      style={{
        background: `linear-gradient(180deg, transparent, ${C.violet}50, ${C.teal}50, transparent)`,
        boxShadow: `0 0 12px 2px ${C.violet}25`,
      }}
      animate={{ left: ['-2%', '102%'] }}
      transition={{ duration: 11, repeat: Infinity, ease: 'linear', repeatDelay: 3, delay: 2 }}
    />
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// AMBIENT BLURS
// ══════════════════════════════════════════════════════════════════════════
const AmbientBlurs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[
      { color: C.sky,     x: '15%',  y: '20%', size: 480, opacity: 0.07 },
      { color: C.teal,    x: '80%',  y: '60%', size: 400, opacity: 0.06 },
      { color: C.violet,  x: '55%',  y: '85%', size: 360, opacity: 0.05 },
      { color: C.emerald, x: '90%',  y: '10%', size: 300, opacity: 0.04 },
      { color: C.amber,   x: '5%',   y: '75%', size: 280, opacity: 0.04 },
    ].map((b, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left:    b.x,
          top:     b.y,
          width:   b.size,
          height:  b.size,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          opacity: b.opacity,
          filter: 'blur(40px)',
        }}
        animate={{
          scale:   [1, 1.15, 0.92, 1],
          opacity: [b.opacity, b.opacity * 1.8, b.opacity * 0.6, b.opacity],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat:   Infinity,
          ease:     'easeInOut',
          delay:    i * 1.2,
        }}
      />
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// CURSOR SPOTLIGHT
// ══════════════════════════════════════════════════════════════════════════
const CursorSpotlight = () => {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 760);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const bgX = useTransform(springX, (v) => `${v}px`);
  const bgY = useTransform(springY, (v) => `${v}px`);

  useEffect(() => {
    const move = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-10"
      style={{
        background: `radial-gradient(520px circle at ${bgX} ${bgY},
          rgba(14,165,233,0.09) 0%,
          rgba(20,184,166,0.05) 30%,
          rgba(139,92,246,0.03) 60%,
          transparent 80%)`,
      }}
    />
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ECG HERO WAVE
// ══════════════════════════════════════════════════════════════════════════
const ECGWave = () => {
  // A single ECG cycle path
  const ecgD = 'M0,40 L40,40 L55,40 L65,5 L75,75 L85,0 L95,65 L105,40 L130,40 L160,40';

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 90 }}>
      <svg
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="ecgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={C.sky}     stopOpacity="0" />
            <stop offset="30%"  stopColor={C.sky}     stopOpacity="1" />
            <stop offset="65%"  stopColor={C.teal}    stopOpacity="1" />
            <stop offset="85%"  stopColor={C.emerald} stopOpacity="1" />
            <stop offset="100%" stopColor={C.emerald} stopOpacity="0" />
          </linearGradient>
          <filter id="ecgGlow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Glow trail */}
        <motion.path
          d={ecgD}
          stroke="url(#ecgLine)"
          strokeWidth="3"
          filter="url(#ecgGlow)"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 0.75, 1] }}
        />
        {/* Sharp overlay */}
        <motion.path
          d={ecgD}
          stroke="url(#ecgLine)"
          strokeWidth="1.5"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 0.75, 1], delay: 0.04 }}
        />
        {/* Traveling dot */}
        <motion.circle r="3.5" fill={C.sky} filter="url(#ecgGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.05, 0.48, 0.55] }}
        >
          <animateMotion dur="1.4s" repeatCount="indefinite" path={ecgD} />
        </motion.circle>
      </svg>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// STAGGERED CHARACTER TEXT
// ══════════════════════════════════════════════════════════════════════════
const StaggerWord = ({ text, className, delay = 0, color }) => {
  const words = text.split(' ');
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: delay } } }}
    >
      {words.map((word, wi) => (
        <motion.span
          key={wi}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden:  { opacity: 0, y: 28, filter: 'blur(8px)' },
            visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
              transition: { type: 'spring', stiffness: 120, damping: 14 } },
          }}
          style={color ? { color } : {}}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ANIMATED METRIC COUNTER
// ══════════════════════════════════════════════════════════════════════════
const MetricCounter = ({ target, suffix = '', color }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString() + suffix);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, target, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    return c.stop;
  }, [inView, target, mv]);

  return (
    <motion.span
      ref={ref}
      className="font-mono text-4xl font-black tracking-tighter"
      style={{ color }}
    >
      {display}
    </motion.span>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// METRIC CARD
// ══════════════════════════════════════════════════════════════════════════
const MetricCard = ({ icon: Icon, label, value, suffix, color, glow, delay }) => {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX  = useTransform(mouseX, (v) => `${v}px`);
  const spotY  = useTransform(mouseY, (v) => `${v}px`);

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-2xl cursor-default"
      style={{
        background: 'rgba(5,11,26,0.7)',
        border: `1px solid ${color}28`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${glow}`,
      }}
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}
      whileHover={{
        y: -6,
        boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 28px ${glow}`,
        borderColor: `${color}55`,
        transition: { type: 'spring', stiffness: 120, damping: 14 },
      }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) { mouseX.set(e.clientX - r.left); mouseY.set(e.clientY - r.top); }
      }}
    >
      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{
          background: `radial-gradient(200px circle at ${spotX} ${spotY}, ${color}12, transparent 70%)`,
        }}
      />
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      {/* Blueprint hover grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={16} color={color} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: `${color}80` }}>
            LIVE·DATA
          </span>
        </div>
        <MetricCounter target={value} suffix={suffix} color={color} />
        <p className="mt-2 font-mono text-xs text-slate-500 tracking-wide">{label}</p>
        {/* Pulse bar */}
        <div className="mt-4 h-px w-full overflow-hidden rounded-full" style={{ background: `${color}20` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FEATURE ROW
// ══════════════════════════════════════════════════════════════════════════
const FEATURES = [
  { icon: FiShield,   color: C.sky,     title: 'Zero-Breach Security',    desc: 'End-to-end encrypted health records with multi-layer role authentication and audit trails.' },
  { icon: FiActivity, color: C.emerald, title: 'Real-Time Vitals Feed',   desc: 'Live telemetry from campus health stations with instant alert dispatch to on-duty staff.' },
  { icon: FiCpu,      color: C.violet,  title: 'AI Triage Engine',        desc: 'Machine-learning risk stratification flags at-risk students before incidents escalate.' },
  { icon: FiDatabase, color: C.teal,    title: 'Unified Records Grid',    desc: 'Every visit, prescription, allergy and immunization in one HIPAA-compliant data matrix.' },
  { icon: FiRadio,    color: C.amber,   title: 'Emergency Broadcast',     desc: 'One-tap campus-wide alert cascade reaching all staff, guardians and emergency services.' },
  { icon: FiLock,     color: C.crimson, title: 'Role-Gated Access',       desc: 'Granular RBAC ensures Doctors, Nurses, Parents and Admins each see exactly their scope.' },
];

const FeatureCard = ({ icon: Icon, color, title, desc, delay }) => (
  <motion.div
    className="group relative overflow-hidden rounded-2xl p-6"
    style={{
      background: 'rgba(5,11,26,0.6)',
      border: '1px solid rgba(51,65,85,0.4)',
      backdropFilter: 'blur(16px)',
    }}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}
    whileHover={{
      borderColor: `${color}40`,
      boxShadow: `0 0 32px ${color}18`,
      transition: { duration: 0.2 },
    }}
  >
    {/* Reveal gradient on hover */}
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-2xl"
      style={{ background: `radial-gradient(200px circle at 30% 40%, ${color}10, transparent 70%)` }}
    />
    <div className="absolute top-0 left-0 right-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

    <div className="relative">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={17} color={color} />
      </div>
      <h3 className="mb-2 font-mono text-sm font-bold text-white tracking-wide">{title}</h3>
      <p className="font-mono text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
// MAIN CTA BUTTON
// ══════════════════════════════════════════════════════════════════════════
const InitializeButton = ({ onClick }) => {
  const btnRef  = useRef(null);
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-40, 40], [6, -6]);
  const rotateY = useTransform(mouseX, [-100, 100], [-8, 8]);

  const handleMove = (e) => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX - r.left - r.width  / 2);
    mouseY.set(e.clientY - r.top  - r.height / 2);
  };
  const handleLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.div style={{ perspective: 800 }}>
      <motion.button
        ref={btnRef}
        onClick={onClick}
        className="relative overflow-hidden rounded-2xl px-10 py-4 font-mono text-sm font-bold tracking-widest text-white uppercase"
        style={{
          background: `linear-gradient(135deg, #0369a1 0%, ${C.sky} 40%, ${C.teal} 70%, ${C.emerald} 100%)`,
          boxShadow: `0 0 40px ${C.sky}55, 0 0 80px ${C.teal}22, 0 8px 32px rgba(0,0,0,0.5)`,
          rotateX,
          rotateY,
          willChange: 'transform',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{
          scale: 1.04,
          boxShadow: `0 0 60px ${C.sky}70, 0 0 120px ${C.teal}30, 0 12px 40px rgba(0,0,0,0.6)`,
        }}
        whileTap={{
          scale: 0.97,
          transition: { type: 'spring', stiffness: 400, damping: 20 },
        }}
        transition={{ type: 'spring', stiffness: 140, damping: 15 }}
      >
        {/* Animated diagonal shine */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.18) 50%, transparent 75%)',
          }}
          animate={{ x: ['-150%', '250%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
        />
        {/* Pulse aura rings */}
        {[0, 0.6, 1.2].map((delay, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ border: `2px solid ${C.sky}` }}
            animate={{ scale: [1, 1.12 + i * 0.06], opacity: [0.35, 0] }}
            transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <span className="relative flex items-center gap-3">
          <FiTerminal size={15} />
          Initialize Command Center
          <FiLogIn size={15} />
        </span>
      </motion.button>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TERMINAL FOOTER TICKER
// ══════════════════════════════════════════════════════════════════════════
const TICKER_ITEMS = [
  'SYS·NOMINAL',
  'ENCRYPTION·ACTIVE',
  'CAMPUS·GRID·ONLINE',
  'HIPAA·COMPLIANT',
  'AI·TRIAGE·READY',
  'ZERO·BREACH·PROTOCOL',
  'HEALTH·OS·v4.1',
  'ALL·NODES·LIVE',
];

const TerminalTicker = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-t border-b py-2.5"
      style={{ borderColor: `${C.sky}20`, background: 'rgba(5,11,26,0.9)' }}>
      {/* Left/right fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{ background: `linear-gradient(90deg, ${C.navy}, transparent)` }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{ background: `linear-gradient(270deg, ${C.navy}, transparent)` }} />

      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em]"
            style={{ color: i % 3 === 0 ? C.sky : i % 3 === 1 ? C.teal : C.emerald }}>
            <motion.span
              className="inline-block h-1 w-1 rounded-full"
              style={{ backgroundColor: 'currentColor' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
            />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const navigate = useNavigate();
  const [booted, setBooted] = useState(false);
const { user, loading } = useAuth();

useEffect(() => {
    if (!loading && user) {
      navigate('/home'); // Auto-forward active sessions straight into the dashboard!
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const metrics = [
    { icon: FiUsers,       color: C.sky,     glow: `${C.sky}50`,     value: 4280,  suffix: '+',  label: 'Students Protected',    delay: 0    },
    { icon: FiActivity,    color: C.teal,    glow: `${C.teal}50`,    value: 18643, suffix: '',   label: 'Health Visits Logged',  delay: 0.08 },
    { icon: FiAlertCircle, color: C.crimson, glow: `${C.crimson}50`, value: 99,    suffix: '.8%', label: 'Emergency Response Rate',delay: 0.16 },
    { icon: FiZap,         color: C.amber,   glow: `${C.amber}50`,   value: 240,   suffix: 'ms', label: 'Avg Alert Dispatch',    delay: 0.24 },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: C.navy,
        fontFamily: "'SF Pro Display', 'IBM Plex Mono', 'JetBrains Mono', monospace",
      }}
    >
      {/* ── Layer stack ── */}
      <AmbientBlurs />
      <AnimatedGrid />
      <ParticleField />
      <CursorSpotlight />

      {/* ═══════════════════════════════════
          HEADER
      ═══════════════════════════════════ */}
      <motion.header
        className="relative z-20 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: `1px solid rgba(14,165,233,0.1)` }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(20,184,166,0.15))',
              border: `1px solid ${C.sky}40`,
              boxShadow: `0 0 24px ${C.sky}25`,
            }}
            animate={{ boxShadow: [`0 0 24px ${C.sky}25`, `0 0 40px ${C.sky}50`, `0 0 24px ${C.sky}25`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            whileHover={{ scale: 1.1 }}
          >
            <FiShield size={18} color={C.sky} style={{ filter: `drop-shadow(0 0 5px ${C.sky})` }} />
          </motion.div>
          <div>
            <p className="font-mono text-xs font-black tracking-[0.25em] text-white uppercase">Guardian Grid</p>
            <p className="font-mono text-[9px] tracking-[0.2em] text-slate-600">Campus Health OS</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {['System', 'Features', 'Security', 'Docs'].map((label, i) => (
            <motion.button
              key={label}
              className="font-mono text-[11px] tracking-widest text-slate-500 uppercase transition-colors hover:text-sky-400"
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {label}
            </motion.button>
          ))}
        </nav>

        {/* Login CTA */}
        <motion.button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-[11px] font-bold tracking-widest text-sky-400 uppercase"
          style={{
            background: `${C.sky}12`,
            border: `1px solid ${C.sky}30`,
          }}
          whileHover={{
            background: `${C.sky}20`,
            borderColor: `${C.sky}60`,
            boxShadow: `0 0 20px ${C.sky}30`,
            y: -1,
          }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <FiLogIn size={12} />
          Sign In
        </motion.button>
      </motion.header>

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section className="relative z-20 flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">

        {/* Status badge */}
        <motion.div
          className="mb-8 flex items-center gap-2.5 rounded-full px-4 py-2"
          style={{
            background: 'rgba(5,11,26,0.8)',
            border: `1px solid ${C.emerald}35`,
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 140, damping: 14 }}
        >
          <motion.span
            className="block h-2 w-2 rounded-full"
            style={{ background: C.emerald, boxShadow: `0 0 8px ${C.emerald}` }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase">
            System Online · All Nodes Nominal
          </span>
        </motion.div>

        {/* Main headline */}
        <h1 className="mb-2 max-w-4xl text-5xl font-black leading-[1.05] tracking-tighter text-white sm:text-7xl">
          <StaggerWord text="The Campus" delay={0.3} />
          <br />
          <StaggerWord
            text="Health Command"
            delay={0.55}
            color="transparent"
            className="bg-clip-text"
          />
        </h1>
        {/* Gradient second line — rendered separately for color */}
        <div className="mb-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tighter sm:text-7xl"
          style={{
            background: `linear-gradient(135deg, ${C.sky} 0%, ${C.teal} 40%, ${C.emerald} 70%, ${C.violet} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <StaggerWord text="Center." delay={0.8} />
        </div>

        {/* Subheadline */}
        <motion.p
          className="mb-4 max-w-xl font-mono text-sm leading-relaxed tracking-wide text-slate-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          An AI-powered rescue grid protecting every student,
          every visit, every emergency — in real time.
        </motion.p>

        {/* ECG wave */}
        <motion.div
          className="mb-8 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <ECGWave />
        </motion.div>

        {/* CTA cluster */}
        <motion.div
          className="flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 120, damping: 16 }}
        >
          <InitializeButton onClick={() => navigate('/login')} />

          <motion.button
            className="flex items-center gap-2 rounded-2xl px-8 py-4 font-mono text-sm font-semibold tracking-widest text-slate-400 uppercase"
            style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.5)' }}
            whileHover={{ borderColor: 'rgba(51,65,85,0.9)', color: '#94a3b8', y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <FiActivity size={14} />
            View Demo
          </motion.button>
        </motion.div>

        {/* Trust row */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.6 }}
        >
          {[
            { label: 'HIPAA Compliant',    color: C.emerald },
            { label: 'SOC 2 Certified',    color: C.sky     },
            { label: 'Zero-Knowledge Enc', color: C.violet  },
            { label: 'FERPA Protected',    color: C.teal    },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-600 uppercase">
              <span className="block h-1 w-1 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
              {label}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════
          METRICS BAND
      ═══════════════════════════════════ */}
      <section className="relative z-20 px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      {/* Ticker */}
      <div className="relative z-20 my-4">
        <TerminalTicker />
      </div>

      {/* ═══════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════ */}
      <section className="relative z-20 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-12 text-center">
            <motion.p
              className="mb-3 font-mono text-[10px] tracking-[0.4em] uppercase"
              style={{ color: C.sky }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              System Architecture
            </motion.p>
            <motion.h2
              className="text-3xl font-black tracking-tight text-white sm:text-4xl"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 16 }}
            >
              Built for Zero-Failure
              <span className="ml-2" style={{
                background: `linear-gradient(90deg, ${C.sky}, ${C.teal})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Healthcare Ops
              </span>
            </motion.h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FINAL CTA BANNER
      ═══════════════════════════════════ */}
      <section className="relative z-20 px-6 pb-20 pt-8">
        <motion.div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-12 text-center"
          style={{
            background: 'rgba(5,11,26,0.8)',
            border: `1px solid ${C.sky}25`,
            backdropFilter: 'blur(24px)',
            boxShadow: `0 0 80px ${C.sky}10`,
          }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        >
          {/* Background radial */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${C.sky}10, transparent 60%)` }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${C.sky}60, ${C.teal}60, transparent)` }} />

          <motion.div
            className="relative mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${C.sky}25, ${C.teal}15)`,
              border: `1px solid ${C.sky}35`,
              boxShadow: `0 0 40px ${C.sky}30`,
            }}
            animate={{ boxShadow: [`0 0 30px ${C.sky}30`, `0 0 55px ${C.sky}55`, `0 0 30px ${C.sky}30`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <FiShield size={26} color={C.sky} style={{ filter: `drop-shadow(0 0 6px ${C.sky})` }} />
          </motion.div>

          <h2 className="relative mb-3 text-3xl font-black tracking-tight text-white">
            Ready to deploy the Grid?
          </h2>
          <p className="relative mb-8 font-mono text-sm leading-relaxed text-slate-500">
            Activate Guardian Grid for your campus and put every student's health
            <br className="hidden sm:block" /> under real-time command and protection.
          </p>

          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <InitializeButton onClick={() => navigate('/login')} />
          </div>

          <p className="relative mt-6 font-mono text-[10px] tracking-widest text-slate-700 uppercase">
            No setup fees · Instant deployment · HIPAA-compliant from day one
          </p>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════
          FOOTER
      ═══════════════════════════════════ */}
      <footer
        className="relative z-20 px-8 py-6"
        style={{ borderTop: `1px solid rgba(14,165,233,0.1)` }}
      >
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <FiShield size={13} color={`${C.sky}60`} />
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-700 uppercase">
              Guardian Grid · Health OS · v4.1 · {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {['Privacy', 'HIPAA', 'Terms', 'Status'].map((l) => (
              <button key={l} className="font-mono text-[10px] tracking-widest text-slate-700 uppercase transition-colors hover:text-slate-400">
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <motion.span className="block h-1.5 w-1.5 rounded-full"
              style={{ background: C.emerald, boxShadow: `0 0 5px ${C.emerald}` }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-700 uppercase">
              All Systems Nominal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
