import { useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from 'framer-motion';

// ─── Per-color design tokens ───────────────────────────────────────────────
const colorTokens = {
  blue: {
    primary:    '#0ea5e9',
    secondary:  '#38bdf8',
    glow:       'rgba(14,165,233,0.5)',
    spotLight:  'rgba(14,165,233,0.07)',
    border:     'rgba(14,165,233,0.25)',
    iconBg:     'rgba(14,165,233,0.12)',
    label:      'SKY',
    radar:      false,
  },
  teal: {
    primary:    '#14b8a6',
    secondary:  '#2dd4bf',
    glow:       'rgba(20,184,166,0.5)',
    spotLight:  'rgba(20,184,166,0.07)',
    border:     'rgba(20,184,166,0.25)',
    iconBg:     'rgba(20,184,166,0.12)',
    label:      'BIO',
    radar:      false,
  },
  purple: {
    primary:    '#8b5cf6',
    secondary:  '#a78bfa',
    glow:       'rgba(139,92,246,0.5)',
    spotLight:  'rgba(139,92,246,0.07)',
    border:     'rgba(139,92,246,0.25)',
    iconBg:     'rgba(139,92,246,0.12)',
    label:      'SYS',
    radar:      false,
  },
  red: {
    primary:    '#ef4444',
    secondary:  '#f87171',
    glow:       'rgba(239,68,68,0.6)',
    spotLight:  'rgba(239,68,68,0.08)',
    border:     'rgba(239,68,68,0.35)',
    iconBg:     'rgba(239,68,68,0.12)',
    label:      'CRIT',
    radar:      true,   // ← radar ring only on critical/red
  },
  amber: {
    primary:    '#f97316',
    secondary:  '#fb923c',
    glow:       'rgba(249,115,22,0.5)',
    spotLight:  'rgba(249,115,22,0.07)',
    border:     'rgba(249,115,22,0.25)',
    iconBg:     'rgba(249,115,22,0.12)',
    label:      'WARN',
    radar:      false,
  },
};

// ─── Motion counter (Framer Motion animate on a MotionValue) ───────────────
const MotionCounter = ({ value, color }) => {
  const motionVal = useMotionValue(0);
  // Round to nearest integer for display
  const rounded = useTransform(motionVal, (v) => Math.round(v).toLocaleString());
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [inView, value, motionVal]);

  return (
    <motion.span
      ref={ref}
      className="font-mono text-3xl font-bold tracking-tighter"
      style={{ color, willChange: 'transform' }}
    >
      {rounded}
    </motion.span>
  );
};

// ─── Radar ring (for critical/emergency cards) ─────────────────────────────
const RadarRings = ({ color, glow }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    {[1, 1.8, 2.6].map((scale, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 48,
          height: 48,
          border: `1px solid ${color}`,
          boxShadow: `0 0 8px ${glow}`,
        }}
        animate={{
          scale: [scale * 0.6, scale * 1.4],
          opacity: [0.6, 0],
        }}
        transition={{
          duration: 2.2,
          delay: i * 0.55,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

// ─── SVG Skeleton shimmer loader ────────────────────────────────────────────
export const CardSkeleton = () => (
  <div
    className="relative overflow-hidden rounded-2xl p-5"
    style={{
      background: 'rgba(15,23,42,0.5)',
      border: '1px solid rgba(51,65,85,0.4)',
    }}
  >
    <div className="space-y-3">
      <div className="h-3 w-20 rounded-full bg-slate-800" />
      <div className="h-8 w-16 rounded-lg bg-slate-800" />
      <div className="h-2 w-28 rounded-full bg-slate-800" />
    </div>
    {/* Shimmer sweep */}
    <motion.div
      className="absolute inset-0 rounded-2xl"
      style={{
        background:
          'linear-gradient(105deg, transparent 30%, rgba(14,165,233,0.06) 50%, transparent 70%)',
      }}
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
    />
  </div>
);

// ─── Main DashboardCard ────────────────────────────────────────────────────
const DashboardCard = ({
  title,
  value,
  icon: Icon,
  color = 'teal',
  subtitle,
  trend,
  index = 0,
}) => {
  const tk = colorTokens[color] || colorTokens.teal;

  // Stripe-style cursor spotlight
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX = useTransform(mouseX, (v) => `${v}px`);
  const spotY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const numericValue = typeof value === 'number' ? value : 0;

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl cursor-default"
      style={{
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${tk.border}`,
        boxShadow: `0 4px 20px -2px rgba(3,7,18,0.5), 0 0 0 0 ${tk.glow}`,
        willChange: 'transform',
      }}
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        delay: index * 0.06,
        type: 'spring',
        stiffness: 140,
        damping: 16,
        mass: 0.8,
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 8px 32px -4px rgba(3,7,18,0.6), 0 0 24px -4px ${tk.glow}`,
        transition: { type: 'spring', stiffness: 140, damping: 15 },
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{
          background: `radial-gradient(280px circle at ${spotX} ${spotY}, ${tk.spotLight}, transparent 70%)`,
        }}
      />

      {/* Radar rings — only for critical cards */}
      {tk.radar && value > 0 && <RadarRings color={tk.primary} glow={tk.glow} />}

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${tk.primary}, transparent)`,
        }}
      />

      {/* Blueprint grid micro-texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${tk.primary} 1px, transparent 1px), linear-gradient(90deg, ${tk.primary} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between">
          {/* Category label */}
          <div className="flex flex-col gap-1">
            <span
              className="font-mono text-[9px] font-medium tracking-[0.3em] uppercase"
              style={{ color: tk.primary }}
            >
              {tk.label}·METRIC
            </span>
            <p className="font-mono text-xs text-slate-400 leading-tight">{title}</p>
          </div>

          {/* Icon */}
          <div
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: tk.iconBg,
              border: `1px solid ${tk.border}`,
              boxShadow: `0 0 16px ${tk.glow}`,
            }}
          >
            {Icon && <Icon size={17} color={tk.primary} />}
            {/* Icon glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ border: `1px solid ${tk.primary}` }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          {typeof value === 'number' ? (
            <MotionCounter value={numericValue} color={tk.secondary} />
          ) : (
            <span
              className="font-mono text-3xl font-bold tracking-tighter"
              style={{ color: tk.secondary }}
            >
              {value}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-mono text-[10px] tracking-wide text-slate-600">{subtitle}</p>
        )}

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1.5">
            <motion.span
              className="font-mono text-[10px] font-semibold"
              style={{ color: trend > 0 ? '#10b981' : '#ef4444' }}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 + 0.6 }}
            >
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </motion.span>
            <span className="font-mono text-[9px] text-slate-600">vs last month</span>
          </div>
        )}

        {/* Bottom status line */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className="h-px flex-1"
            style={{
              background: `linear-gradient(90deg, ${tk.primary}30, transparent)`,
            }}
          />
          <motion.span
            className="font-mono text-[9px] tracking-widest"
            style={{ color: `${tk.primary}60` }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
          >
            LIVE
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
