import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiActivity, FiCalendar, FiAlertCircle, FiPackage,
  FiRefreshCw, FiShield,
} from 'react-icons/fi';
import DashboardCard, { CardSkeleton } from '../../components/ui/DashboardCard';
import DiseaseTrendsChart from '../../components/charts/DiseaseTrendsChart';
import VisitStatisticsChart from '../../components/charts/VisitStatisticsChart';
import HealthAnalyticsChart from '../../components/charts/HealthAnalyticsChart';
import { CommonDiseasesChart } from '../../components/charts/AnalyticsCharts';
import DataTable from '../../components/tables/DataTable';
import { dashboardService } from '../../services/dashboardService';
import { getHealthStatusColor } from '../../utils/helpers';

// ─── Animation variants ────────────────────────────────────────────────────
const pageVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden:  { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 140, damping: 16 },
  },
};

const rowVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  sky:     '#0ea5e9',
  teal:    '#14b8a6',
  emerald: '#10b981',
  crimson: '#ef4444',
};

// ─── Guardian glass panel ──────────────────────────────────────────────────
const GlassPanel = ({ children, className = '', accentColor = C.sky, title, titleIcon: Icon, delay = 0 }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl ${className}`}
    style={{
      background: 'rgba(15,23,42,0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(51,65,85,0.55)',
      boxShadow: '0 4px 24px rgba(3,7,18,0.45), 0 0 0 0 transparent',
    }}
    variants={sectionVariants}
    whileHover={{
      borderColor: `${accentColor}30`,
      boxShadow: `0 8px 32px rgba(3,7,18,0.55), 0 0 20px ${accentColor}08`,
      transition: { duration: 0.25 },
    }}
  >
    {/* Top accent bar */}
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }}
    />
    {/* Micro blueprint grid */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    />

    <div className="relative p-6">
      {title && (
        <div className="mb-5 flex items-center gap-2.5">
          {Icon && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
              style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
            >
              <Icon size={13} color={accentColor} />
            </div>
          )}
          <div>
            <h3 className="font-mono text-xs font-bold tracking-widest text-white uppercase">
              {title}
            </h3>
          </div>
          {/* Live pulse dot */}
          <div className="ml-auto flex items-center gap-1.5">
            <motion.span
              className="block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">Live</span>
          </div>
        </div>
      )}
      {children}
    </div>
  </motion.div>
);

// ─── Status badge for the visits table ────────────────────────────────────
const VisitStatusBadge = ({ status }) => {
  const config = {
    completed:    { color: C.emerald, label: 'Completed',   glow: 'rgba(16,185,129,0.4)'  },
    'in-progress':{ color: C.sky,     label: 'In Progress', glow: 'rgba(14,165,233,0.4)'  },
    pending:      { color: '#f97316', label: 'Pending',     glow: 'rgba(249,115,22,0.4)'  },
    critical:     { color: C.crimson, label: 'Critical',    glow: 'rgba(239,68,68,0.4)'   },
  };
  const cfg = config[status] || config.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wide capitalize"
      style={{
        background: `${cfg.color}15`,
        border: `1px solid ${cfg.color}35`,
        color: cfg.color,
      }}
    >
      <motion.span
        className="block h-1 w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.color, boxShadow: `0 0 4px ${cfg.glow}` }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      {cfg.label}
    </span>
  );
};

// ─── Guardian skeleton loader ──────────────────────────────────────────────
const GuardianPageSkeleton = () => (
  <motion.div
    className="space-y-6"
    variants={pageVariants}
    initial="hidden"
    animate="visible"
  >
    {/* KPI row skeletons */}
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      variants={rowVariants}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div key={i} variants={sectionVariants}>
          <CardSkeleton />
        </motion.div>
      ))}
    </motion.div>

    {/* Chart row skeletons */}
    <motion.div className="grid gap-4 lg:grid-cols-2" variants={rowVariants}>
      {[0, 1].map((i) => (
        <motion.div key={i} variants={sectionVariants}>
          <div
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: 'rgba(15,23,42,0.5)',
              border: '1px solid rgba(51,65,85,0.4)',
              height: 320,
            }}
          >
            <div className="mb-4 h-3 w-32 rounded-full bg-slate-800/80" />
            <div className="h-56 w-full rounded-xl bg-slate-800/40" />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(14,165,233,0.04) 50%, transparent 70%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// ─── Error state ───────────────────────────────────────────────────────────
const GuardianError = ({ message, onRetry }) => (
  <motion.div
    className="flex min-h-[40vh] flex-col items-center justify-center gap-5"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', stiffness: 140, damping: 16 }}
  >
    <div
      className="flex h-14 w-14 items-center justify-center rounded-2xl"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
    >
      <FiAlertCircle size={22} color={C.crimson} />
    </div>
    <div className="text-center">
      <p className="font-mono text-sm font-bold text-white tracking-wide">System Error</p>
      <p className="mt-1 font-mono text-xs text-slate-500">{message}</p>
    </div>
    <motion.button
      onClick={onRetry}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-sky-400 uppercase"
      style={{
        background: 'rgba(14,165,233,0.1)',
        border: '1px solid rgba(14,165,233,0.25)',
      }}
      whileHover={{ background: 'rgba(14,165,233,0.18)', boxShadow: `0 0 20px rgba(14,165,233,0.25)` }}
      whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      <FiRefreshCw size={12} />
      Retry Connection
    </motion.button>
  </motion.div>
);

// ─── Empty chart state ─────────────────────────────────────────────────────
const GuardianEmpty = ({ title, description }) => (
  <div className="flex h-52 flex-col items-center justify-center gap-3 text-center">
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}
    >
      <FiShield size={16} color="rgba(14,165,233,0.5)" />
    </div>
    <div>
      <p className="font-mono text-xs font-bold text-slate-500 tracking-wide">{title}</p>
      <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-700 max-w-xs">{description}</p>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
// ══════════════════════════════════════════════════════════════════════════
const DashboardHome = () => {
  // ── ALL ORIGINAL HOOKS & STATE ─────────────────────────────────────────
  const location = useLocation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[DashboardHome] mounted', {
      pathname: location.pathname,
      user,
      role: user?.role,
    });
  }, [location.pathname, user]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, visitsData, analyticsData] = await Promise.all([
        dashboardService.getDashboard(),
        dashboardService.getRecentVisits(),
        dashboardService.getAnalytics(),
      ]);
      setDashboard(dashData);
      setRecentVisits(visitsData.visits || []);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── ORIGINAL COLUMN DEFINITIONS — ALL PRESERVED ───────────────────────
  const visitColumns = [
    { key: 'studentName', label: 'Student' },
    { key: 'time',        label: 'Time'    },
    { key: 'reason',      label: 'Reason'  },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <VisitStatusBadge
          status={
            row.status === 'completed'   ? 'completed'    :
            row.status === 'in-progress' ? 'in-progress'  :
            row.status
          }
        />
      ),
    },
  ];
  // ──────────────────────────────────────────────────────────────────────

  // ── LOADING ────────────────────────────────────────────────────────────
  if (loading) return <GuardianPageSkeleton />;

  // ── ERROR ──────────────────────────────────────────────────────────────
  if (error) return <GuardianError message={error} onRetry={fetchData} />;

  // ── MAIN RENDER ────────────────────────────────────────────────────────
  return (
    <motion.div
      className="space-y-5"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ── Section label ── */}
      <motion.div
        className="flex items-center gap-2"
        variants={sectionVariants}
      >
        <span className="font-mono text-[9px] tracking-[0.35em] text-slate-600 uppercase">
          Command Overview
        </span>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.2), transparent)' }} />
        <span className="font-mono text-[9px] tracking-widest text-slate-700">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </motion.div>

      {/* ── KPI VITAL CARDS ── */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        variants={rowVariants}
      >
        <DashboardCard title="Total Students"      value={dashboard.totalStudents}    icon={FiUsers}       color="blue"   index={0} />
        <DashboardCard title="Total Visits"        value={dashboard.totalVisits}      icon={FiActivity}    color="teal"   index={1} />
        <DashboardCard title="Today's Visits"      value={dashboard.todayVisits}      icon={FiCalendar}    color="purple" index={2} />
        <DashboardCard title="Emergency Cases"     value={dashboard.emergencyCases}   icon={FiAlertCircle} color="red"    index={3} />
        <DashboardCard title="Low Stock Medicines" value={dashboard.lowStockMedicines}icon={FiPackage}     color="amber"  index={4} />
      </motion.div>

      {/* ── CHART ROW 1: Disease Trends + Visit Statistics ── */}
      <motion.div
        className="grid gap-4 lg:grid-cols-2"
        variants={rowVariants}
      >
        <GlassPanel
          title="Disease Trends"
          titleIcon={FiActivity}
          accentColor={C.sky}
        >
          {dashboard.diseaseTrends?.length > 0 ? (
            <DiseaseTrendsChart data={dashboard.diseaseTrends} />
          ) : analytics?.commonDiseases?.length > 0 ? (
            <CommonDiseasesChart data={analytics.commonDiseases} />
          ) : (
            <GuardianEmpty
              title="No Trend Data"
              description="Disease trend data will appear once medical records are recorded."
            />
          )}
        </GlassPanel>

        <GlassPanel
          title="Visit Statistics"
          titleIcon={FiCalendar}
          accentColor={C.teal}
        >
          {dashboard.visitStatistics?.length > 0 ? (
            <VisitStatisticsChart data={dashboard.visitStatistics} />
          ) : (
            <GuardianEmpty
              title="No Visit Statistics"
              description="Visit statistics will appear as more records are added."
            />
          )}
        </GlassPanel>
      </motion.div>

      {/* ── CHART ROW 2: Health Analytics + Recent Visits Table ── */}
      <motion.div
        className="grid gap-4 lg:grid-cols-3"
        variants={rowVariants}
      >
        {/* Health analytics — 1/3 */}
        <GlassPanel
          className="lg:col-span-1"
          title="Health Analytics"
          titleIcon={FiShield}
          accentColor={C.emerald}
        >
          {dashboard.healthAnalytics?.length > 0 ? (
            <HealthAnalyticsChart data={dashboard.healthAnalytics} />
          ) : (
            <GuardianEmpty
              title="No Health Analytics"
              description="Health analytics will be available once student data is collected."
            />
          )}
        </GlassPanel>

        {/* Recent visits table — 2/3 */}
        <GlassPanel
          className="lg:col-span-2"
          title="Recent Visits"
          titleIcon={FiUsers}
          accentColor={C.sky}
        >
          {recentVisits.length > 0 ? (
            /* ── DataTable: original component, styled wrapper only ── */
            <div className="overflow-hidden rounded-xl"
              style={{ border: '1px solid rgba(51,65,85,0.4)' }}>
              <div
                className="overflow-x-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(51,65,85,0.6) transparent',
                }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.5)', background: 'rgba(15,23,42,0.6)' }}>
                      {visitColumns.map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left font-mono text-[9px] font-medium tracking-[0.25em] text-slate-600 uppercase"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {recentVisits.map((row, i) => (
                        <motion.tr
                          key={row.id || i}
                          className="group"
                          style={{ borderBottom: '1px solid rgba(51,65,85,0.25)' }}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, type: 'spring', stiffness: 140, damping: 16 }}
                          whileHover={{ backgroundColor: 'rgba(14,165,233,0.04)' }}
                        >
                          {visitColumns.map((col) => (
                            <td
                              key={col.key}
                              className="px-4 py-3 font-mono text-xs text-slate-300"
                            >
                              {col.render ? col.render(row) : row[col.key]}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <GuardianEmpty
              title="No Recent Visits"
              description="Student visit records will appear here as they are logged."
            />
          )}
        </GlassPanel>
      </motion.div>

    </motion.div>
  );
};

export default DashboardHome;
