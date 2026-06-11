import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

// ─── Page transition variants ──────────────────────────────────────────────
const pageVariants = {
  hidden:  { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { cubicBezier: [0.16, 1, 0.3, 1], duration: 0.5 },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: 'blur(3px)',
    transition: { duration: 0.2 },
  },
};

const DashboardLayout = ({ title = 'Dashboard' }) => {
  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────────
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.log('[DashboardLayout] mounted', {
      pathname: location.pathname,
      user,
      role: user?.role,
    });
  }, [location.pathname, user]);
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen overflow-hidden"
      style={{
        background: '#050B1A',
        fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Global ambient background ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(14,165,233,0.05) 0%, transparent 60%)',
        }}
      />

      {/* ── Blueprint grid ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Sidebar ── */}
      <div className="relative z-10 flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Main content column ── */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Navbar title={title} />

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Scrollable inner wrapper with padding */}
          <div className="min-h-full p-6">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* ── Bottom status strip ── */}
        <div
          className="flex-shrink-0 px-6 py-2"
          style={{
            borderTop: '1px solid rgba(51,65,85,0.3)',
            background: 'rgba(5,11,26,0.6)',
          }}
        >
          <div className="flex items-center justify-between font-mono text-[9px] text-slate-700">
            <span>GUARDIAN·GRID · HEALTH·OS</span>
            <span className="flex items-center gap-1.5">
              <motion.span
                className="block h-1 w-1 rounded-full bg-emerald-500"
                style={{ boxShadow: '0 0 4px rgba(16,185,129,0.7)' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {location.pathname.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
