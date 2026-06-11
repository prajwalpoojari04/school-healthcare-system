import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Area, AreaChart, Cell,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────
const GRID_COLOR     = 'rgba(51,65,85,0.35)';
const TICK_STYLE     = { fontSize: 10, fill: '#475569', fontFamily: 'monospace', letterSpacing: '0.05em' };
const CHART_ENTRANCE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } };

// ─── Custom Animated Tooltip ───────────────────────────────────────────────
const GuardianTooltip = ({ active, payload, label, colorKey = '#0ea5e9' }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      style={{
        background: 'rgba(5,11,26,0.92)',
        border: `1px solid ${colorKey}40`,
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: `0 8px 32px rgba(3,7,18,0.6), 0 0 20px ${colorKey}18`,
        backdropFilter: 'blur(16px)',
        minWidth: 120,
      }}
    >
      <p
        className="font-mono text-[9px] tracking-[0.25em] uppercase mb-2"
        style={{ color: `${colorKey}90` }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="block h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color || colorKey, boxShadow: `0 0 6px ${entry.color || colorKey}` }}
          />
          <span className="font-mono text-xs text-slate-300">
            {entry.name}
          </span>
          <span
            className="ml-auto font-mono text-xs font-bold"
            style={{ color: entry.color || colorKey }}
          >
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// ─── Gradient defs shared across charts ───────────────────────────────────
const SkyGradientDef = () => (
  <defs>
    <linearGradient id="gradSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#0ea5e9" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.01} />
    </linearGradient>
    <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#14b8a6" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.01} />
    </linearGradient>
    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.01} />
    </linearGradient>
    <filter id="chartGlow">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

// ─── Bar color ramp for horizontal disease bars ────────────────────────────
const DISEASE_COLORS = ['#0ea5e9', '#38bdf8', '#14b8a6', '#2dd4bf', '#0284c7', '#06b6d4'];

// ─── CommonDiseasesChart ───────────────────────────────────────────────────
export const CommonDiseasesChart = ({ data }) => (
  <motion.div {...CHART_ENTRANCE} className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
        <defs>
          {DISEASE_COLORS.map((c, i) => (
            <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={c} stopOpacity={0.9} />
              <stop offset="100%" stopColor={c} stopOpacity={0.4} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          width={90}
          tick={TICK_STYLE}
          stroke="transparent"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<GuardianTooltip colorKey="#0ea5e9" />}
          cursor={{ fill: 'rgba(14,165,233,0.04)' }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {(data || []).map((_, i) => (
            <Cell key={i} fill={`url(#barGrad${i % DISEASE_COLORS.length})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

// ─── StudentVisitsChart ────────────────────────────────────────────────────
export const StudentVisitsChart = ({ data }) => (
  <motion.div {...CHART_ENTRANCE} className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="visitsBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#14b8a6" stopOpacity={1}    />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="grade" tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <YAxis tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <Tooltip
          content={<GuardianTooltip colorKey="#14b8a6" />}
          cursor={{ fill: 'rgba(20,184,166,0.04)' }}
        />
        <Bar dataKey="visits" fill="url(#visitsBarGrad)" radius={[5, 5, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

// ─── MonthlyTrendsChart ────────────────────────────────────────────────────
export const MonthlyTrendsChart = ({ data }) => (
  <motion.div {...CHART_ENTRANCE} className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
        <SkyGradientDef />
        <CartesianGrid strokeDasharray="2 4" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <YAxis tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <Tooltip
          content={(props) => (
            <GuardianTooltip {...props} colorKey="#0ea5e9" />
          )}
          cursor={{ stroke: 'rgba(14,165,233,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', color: '#475569' }}
          iconType="circle"
          iconSize={6}
        />
        {/* Visits area */}
        <Area
          type="monotone"
          dataKey="visits"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#gradSky)"
          dot={{ r: 3, fill: '#0ea5e9', stroke: '#050B1A', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: '#38bdf8', stroke: '#050B1A', strokeWidth: 2, filter: 'url(#chartGlow)' }}
        />
        {/* Emergencies area */}
        <Area
          type="monotone"
          dataKey="emergencies"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#gradRed)"
          dot={{ r: 3, fill: '#ef4444', stroke: '#050B1A', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: '#f87171', stroke: '#050B1A', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

// ─── Teal line chart (used by DiseaseTrends / VisitStatistics fallbacks) ──
export const TealLineChart = ({ data, dataKey = 'value', xKey = 'name' }) => (
  <motion.div {...CHART_ENTRANCE} className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
        <defs>
          <SkyGradientDef />
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={xKey} tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <YAxis tick={TICK_STYLE} stroke="transparent" axisLine={false} tickLine={false} />
        <Tooltip
          content={<GuardianTooltip colorKey="#14b8a6" />}
          cursor={{ stroke: 'rgba(20,184,166,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#14b8a6"
          strokeWidth={2}
          fill="url(#gradTeal)"
          dot={{ r: 3, fill: '#14b8a6', stroke: '#050B1A', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: '#2dd4bf', stroke: '#050B1A', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);
