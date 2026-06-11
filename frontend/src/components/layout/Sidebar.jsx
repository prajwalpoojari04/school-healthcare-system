import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiFileText, FiAlertTriangle, FiBarChart2,
  FiSearch, FiClipboard, FiUserCheck, FiDownload, FiBell,
  FiMenu, FiX, FiChevronRight, FiShield,
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { normalizeRole } from '../../utils/helpers';

// ─── ALL ORIGINAL DATA PRESERVED ─────────────────────────────────────────────
const roleNavItems = {
  Admin: [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/students', label: 'Students', icon: FiUsers },
    { path: '/medical-records', label: 'Medical Records', icon: FiFileText },
    { path: '/alerts', label: 'Health Alerts', icon: FiAlertTriangle },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  ],
  Doctor: [
    { path: '/doctor', label: 'Dashboard', icon: FiHome },
    { path: '/doctor/patients', label: 'Patient Search', icon: FiSearch },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: FiClipboard },
    { path: '/doctor/cases', label: 'Case Management', icon: FiFileText },
    { path: '/medical-records', label: 'Medical Records', icon: FiFileText },
    { path: '/alerts', label: 'Health Alerts', icon: FiAlertTriangle },
  ],
  Nurse: [
    { path: '/nurse', label: 'Dashboard', icon: FiHome },
    { path: '/nurse/check-in', label: 'Student Check-In', icon: FiUserCheck },
    { path: '/nurse/records', label: 'Records Entry', icon: FiFileText },
    { path: '/students', label: 'Students', icon: FiUsers },
    { path: '/alerts', label: 'Health Alerts', icon: FiAlertTriangle },
  ],
  Parent: [
    { path: '/parent', label: 'Dashboard', icon: FiHome },
    { path: '/parent/records', label: 'Health Records', icon: FiFileText },
    { path: '/parent/reports', label: 'Download Reports', icon: FiDownload },
    { path: '/parent/notifications', label: 'Notifications', icon: FiBell },
  ],
};

// ─── Role badge config ─────────────────────────────────────────────────────
const roleBadgeConfig = {
  Doctor:  { color: '#10b981', shadow: 'rgba(16,185,129,0.6)',  label: 'DOCTOR'  },
  Nurse:   { color: '#f97316', shadow: 'rgba(249,115,22,0.6)',  label: 'NURSE'   },
  Admin:   { color: '#0ea5e9', shadow: 'rgba(14,165,233,0.6)',  label: 'ADMIN'   },
  Parent:  { color: '#0ea5e9', shadow: 'rgba(14,165,233,0.6)',  label: 'PARENT'  },
};

// ─── Sidebar variants ──────────────────────────────────────────────────────
const sidebarVariants = {
  expanded: { width: 240, transition: { type: 'spring', stiffness: 140, damping: 18, mass: 0.8 } },
  collapsed: { width: 68,  transition: { type: 'spring', stiffness: 140, damping: 18, mass: 0.8 } },
};

const labelVariants = {
  expanded:  { opacity: 1, x: 0,   width: 'auto', transition: { delay: 0.05, duration: 0.2 } },
  collapsed: { opacity: 0, x: -8,  width: 0,      transition: { duration: 0.15 } },
};

const logoTextVariants = {
  expanded:  { opacity: 1, x: 0,  transition: { delay: 0.08, duration: 0.2 } },
  collapsed: { opacity: 0, x: -6, transition: { duration: 0.12 } },
};

// ─── Nav Item ─────────────────────────────────────────────────────────────
const NavItem = ({ item, isCollapsed, onClose }) => {
  const location = useLocation();
  const isActive =
    location.pathname === item.path ||
    (item.path !== '/dashboard' &&
      item.path !== '/doctor' &&
      item.path !== '/nurse' &&
      item.path !== '/parent' &&
      location.pathname.startsWith(item.path));

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className="relative block"
      title={isCollapsed ? item.label : undefined}
    >
      {/* macOS-style layoutId sliding background */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(20,184,166,0.08) 100%)',
            border: '1px solid rgba(14,165,233,0.2)',
            boxShadow: '0 0 20px rgba(14,165,233,0.06)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      <div
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'text-sky-300'
            : 'text-slate-500 hover:text-slate-200'
        }`}
        style={{ minHeight: 42 }}
      >
        {/* Icon with glow on active */}
        <span
          className="relative flex-shrink-0"
          style={
            isActive
              ? { filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.7))' }
              : {}
          }
        >
          <item.icon className="h-[18px] w-[18px]" />
        </span>

        {/* Label — animates out when collapsed */}
        <motion.span
          variants={labelVariants}
          className="overflow-hidden whitespace-nowrap font-mono text-xs tracking-wide"
          style={{ willChange: 'opacity, transform' }}
        >
          {item.label}
        </motion.span>

        {/* Active right-edge accent */}
        {isActive && !isCollapsed && (
          <motion.span
            layoutId="sidebar-active-dot"
            className="ml-auto flex-shrink-0"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <FiChevronRight size={12} className="text-sky-400" />
          </motion.span>
        )}
      </div>
    </NavLink>
  );
};

// ─── Role Badge ───────────────────────────────────────────────────────────
const RoleBadge = ({ role, isCollapsed }) => {
  const cfg = roleBadgeConfig[role] || roleBadgeConfig.Admin;
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {/* Pulsing dot */}
      <div className="relative flex-shrink-0">
        <motion.span
          className="block h-2 w-2 rounded-full"
          style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px 1px ${cfg.shadow}` }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            key="badge-label"
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{ color: cfg.color }}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.2 }}
          >
            {cfg.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Shared Sidebar Content ───────────────────────────────────────────────
const SidebarContent = ({ isCollapsed, setCollapsed, navItems, role, onClose }) => (
  <div className="flex h-full flex-col">
    {/* ── Logo ── */}
    <div className="flex items-center justify-between px-3 py-5">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Shield + cross logo */}
        <motion.div
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(20,184,166,0.15) 100%)',
            border: '1px solid rgba(14,165,233,0.3)',
            boxShadow: '0 0 20px rgba(14,165,233,0.15)',
          }}
          whileHover={{ scale: 1.08, boxShadow: '0 0 28px rgba(14,165,233,0.35)' }}
          whileTap={{ scale: 0.95, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
          transition={{ type: 'spring', stiffness: 140, damping: 15 }}
        >
          <FiShield size={18} color="#0ea5e9" style={{ filter: 'drop-shadow(0 0 4px rgba(14,165,233,0.8))' }} />
          {/* Subtle pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-xl border border-sky-400/30"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Logo text */}
        <motion.div
          variants={logoTextVariants}
          className="overflow-hidden"
          style={{ willChange: 'opacity, transform' }}
        >
          <p className="whitespace-nowrap font-mono text-xs font-bold tracking-widest text-white">
            GUARDIAN
          </p>
          <p className="whitespace-nowrap font-mono text-[9px] tracking-[0.25em] text-slate-500">
            HEALTH OS
          </p>
        </motion.div>
      </div>

      {/* Collapse toggle — desktop only */}
      {setCollapsed && (
        <motion.button
          onClick={() => setCollapsed((v) => !v)}
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
          whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <FiMenu size={15} />
          </motion.div>
        </motion.button>
      )}
    </div>

    {/* ── Divider ── */}
    <div
      className="mx-3 mb-3 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.2), transparent)' }}
    />

    {/* ── Nav label ── */}
    <AnimatePresence>
      {!isCollapsed && (
        <motion.p
          key="nav-section-label"
          className="mb-2 px-4 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          Navigation
        </motion.p>
      )}
    </AnimatePresence>

    {/* ── Nav items ── */}
    <nav className="flex-1 space-y-0.5 px-2">
      {navItems.map((item, i) => (
        <motion.div
          key={item.path}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 + 0.1, type: 'spring', stiffness: 140, damping: 18 }}
        >
          <NavItem item={item} isCollapsed={isCollapsed} onClose={onClose} />
        </motion.div>
      ))}
    </nav>

    {/* ── Role badge + system status ── */}
    <div className="px-3 pb-5">
      <div
        className="rounded-xl p-3"
        style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(51,65,85,0.5)',
        }}
      >
        <RoleBadge role={role} isCollapsed={isCollapsed} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              key="status-line"
              className="mt-2 flex items-center gap-1.5"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-mono text-[9px] tracking-widest text-slate-600">
                SYS·NOMINAL
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────
const Sidebar = () => {
  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────────
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = roleNavItems[normalizeRole(user?.role)] || roleNavItems.Admin;
  // ──────────────────────────────────────────────────────────────────────────

  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = normalizeRole(user?.role) || 'Admin';

  return (
    <>
      {/* ── Mobile trigger ── */}
      <motion.button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-xl lg:hidden"
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(14,165,233,0.2)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(3,7,18,0.5)',
        }}
        whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      >
        <FiMenu size={16} color="#94a3b8" />
      </motion.button>

      {/* ── Desktop floating glass dock ── */}
      <motion.aside
        className="relative hidden flex-shrink-0 lg:flex"
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        style={{ willChange: 'width' }}
      >
        {/* Outer glow */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.15) 20%, rgba(14,165,233,0.15) 80%, transparent)',
          }}
        />

        {/* Glass surface */}
        <div
          className="flex h-full w-full flex-col overflow-hidden"
          style={{
            background: 'rgba(5,11,26,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(51,65,85,0.5)',
          }}
        >
          {/* Blueprint grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex h-full flex-col">
            <motion.div
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="flex h-full flex-col"
            >
              <SidebarContent
                isCollapsed={isCollapsed}
                setCollapsed={setIsCollapsed}
                navItems={navItems}
                role={role}
                onClose={null}
              />
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ backdropFilter: 'blur(4px)' }}
            />

            {/* Drawer */}
            <motion.aside
              className="absolute left-0 top-0 flex h-full w-60 flex-col overflow-hidden"
              style={{
                background: 'rgba(5,11,26,0.95)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(51,65,85,0.5)',
                boxShadow: '4px 0 40px rgba(3,7,18,0.7)',
                willChange: 'transform',
              }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              {/* Blueprint grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage:
                    'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Close button */}
              <motion.button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-5 z-10 rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={16} />
              </motion.button>

              <div className="relative h-full">
                <SidebarContent
                  isCollapsed={false}
                  setCollapsed={null}
                  navItems={navItems}
                  role={role}
                  onClose={() => setMobileOpen(false)}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
