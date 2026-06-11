import { motion } from 'framer-motion';
import { MdLocalHospital } from 'react-icons/md';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="flex min-h-screen">
    <div className="hidden w-1/2 gradient-health lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md text-center text-white"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <MdLocalHospital className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">SchoolHealth</h1>
        <p className="text-lg text-white/80">
          Comprehensive healthcare management for educational institutions. Monitor student health,
          manage medical records, and ensure student wellbeing.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '1,200+', label: 'Students' },
            { value: '50+', label: 'Staff' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    <div className="flex w-full flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 lg:w-1/2">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-health text-white">
          <MdLocalHospital className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">SchoolHealth</span>
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="glass-card">{children}</div>
        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} SchoolHealth Management System
        </p>
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
