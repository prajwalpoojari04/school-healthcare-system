import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiMoon, FiSun, FiShield, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROLE_LABELS, getInitials } from '../../utils/helpers';
import NotificationBell from '../ui/NotificationBell';

// ─── Role badge visual config ──────────────────────────────────────────────
const roleBadgeConfig = {
  Doctor:  { color: '#10b981', glow: 'rgba(16,185,129,0.5)',  bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)' },
  Nurse:   { color: '#f97316', glow: 'rgba(249,115,22,0.5)',  bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.25)' },
  Admin:   { color: '#0ea5e9', glow: 'rgba(14,165,233,0.5)',  bg: 'rgba(14,165,233,0.10)',  border: 'rgba(14,165,233,0.25)' },
  Parent:  { color: '#0ea5e9', glow: 'rgba(14,165,233,0.5)',  bg: 'rgba(14,165,233,0.10)',  border: 'rgba(14,165,233,0.25)' },
};

// ─── Avatar initials gradient per role ─────────────────────────────────────
const roleAvatarGradient = {
  Doctor:  'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
  Nurse:   'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
  Admin:   'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)',
  Parent:  'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)',
};

// ─── Animated Role Badge ────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const cfg = roleBadgeConfig[role] || roleBadgeConfig.Admin;
  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 15, delay: 0.3 }}
    >
      <motion.span
        className="block h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px 1px ${cfg.glow}` }}
        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        className="font-mono text-[9px] font-medium tracking-widest"
        style={{ color: cfg.color }}
      >
        {(ROLE_LABELS[role] || role || 'USER').toUpperCase()}
      </span>
    </motion.div>
  );
};

// ─── Icon Button wrapper ────────────────────────────────────────────────────
const NavIconButton = ({ onClick, title, children, danger = false }) => (
  <motion.button
    onClick={onClick}
    title={title}
    className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors"
    style={{
      background: 'rgba(15,23,42,0.5)',
      border: '1px solid rgba(51,65,85,0.5)',
    }}
    whileHover={{
      y: -1,
      backgroundColor: danger ? 'rgba(239,68,68,0.12)' : 'rgba(14,165,233,0.08)',
      borderColor: danger ? 'rgba(239,68,68,0.3)' : 'rgba(14,165,233,0.25)',
      color: danger ? '#f87171' : '#e2e8f0',
    }}
    whileTap={{ scale: 0.93, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    transition={{ type: 'spring', stiffness: 140, damping: 15 }}
  >
    {children}
  </motion.button>
);

// ─── Navbar Component ───────────────────────────────────────────────────────
const Navbar = ({ title }) => {
  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────────
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  // ──────────────────────────────────────────────────────────────────────────

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const role = user?.role;
  const cfg = roleBadgeConfig[role] || roleBadgeConfig.Admin;
  const avatarGradient = roleAvatarGradient[role] || roleAvatarGradient.Admin;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-30 overflow-visible"
      style={{
        background: 'rgba(5,11,26,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(51,65,85,0.5)',
        willChange: 'transform',
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.1 }}
    >
      {/* Top clinical accent gradient strip */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.4) 30%, rgba(20,184,166,0.4) 70%, transparent 100%)',
        }}
      />

      {/* Grid architecture styling */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex items-center justify-between px-6 py-3 lg:pl-6 pl-16">

        {/* ── Left Side: Title block ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <FiShield size={13} className="text-sky-500/50" />
            <h2 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
              {title || "COMMAND CENTER"}
            </h2>
          </div>
          <p className="mt-0.5 font-mono text-[11px] tracking-wide text-slate-500">
            Welcome back, <span className="text-slate-300 font-semibold">{user?.name?.split(' ')[0]}</span>
          </p>
        </motion.div>

        {/* ── Right Side: Command Action Clusters ── */}
        <div className="flex items-center gap-3">
          
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 15 }}
          >
            <NotificationBell />
          </motion.div>

          {/* Theme Shift Control */}
          <NavIconButton onClick={toggleDarkMode} title="Toggle theme">
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.span
                  key="sun"
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <FiSun size={15} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <FiMoon size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </NavIconButton>

          {/* Interactive User Account Dropdown System */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-left transition-all"
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: dropdownOpen ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(51,65,85,0.6)',
                boxShadow: '0 2px 12px rgba(3,7,18,0.3)',
              }}
              whileHover={{
                borderColor: 'rgba(14,165,233,0.25)',
                boxShadow: '0 4px 20px rgba(14,165,233,0.08)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Avatar Shield */}
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: avatarGradient,
                  boxShadow: `0 0 12px ${cfg.glow}`,
                }}
              >
                <span className="font-mono text-[10px] font-bold text-white">
                  {getInitials(user?.name)}
                </span>
              </div>

              {/* Identity Metrics */}
              <div className="hidden md:block">
                <p className="font-mono text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                  {user?.name}
                </p>
                <div className="mt-0.5">
                  <RoleBadge role={role} />
                </div>
              </div>

              <motion.div
                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-slate-400 hidden sm:block"
              >
                <FiChevronDown size={14} />
              </motion.div>
            </motion.button>

            {/* Absolute Glass Dropdown Layer */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50 shadow-[0_10px_30px_rgba(3,7,18,0.6)]"
                  style={{
                    background: 'rgba(10,17,40,0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    willChange: 'transform, opacity',
                  }}
                >
                  {/* Dropdown Header Readout */}
                  <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60">
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Authenticated Session</p>
                    <p className="text-xs font-mono font-medium text-slate-300 mt-0.5 truncate">{user?.email}</p>
                  </div>

                  {/* Operational Controls List */}
                  <div className="p-1.5 space-y-0.5">
                    <motion.button
                      whileHover={{ x: 3, backgroundColor: 'rgba(14,165,233,0.06)', color: '#0ea5e9' }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-slate-400 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser size={14} />
                      <span>My Profile Spec</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 3, backgroundColor: 'rgba(14,165,233,0.06)', color: '#0ea5e9' }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-slate-400 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiSettings size={14} />
                      <span>System Configuration</span>
                    </motion.button>

                    <div className="h-px bg-slate-800/60 my-1" />

                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-red-400 transition-colors"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                    >
                      <FiLogOut size={14} />
                      <span>Terminate Session</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;