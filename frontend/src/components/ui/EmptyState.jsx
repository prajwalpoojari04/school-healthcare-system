import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
    )}
    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {action}
  </motion.div>
);

export default EmptyState;
