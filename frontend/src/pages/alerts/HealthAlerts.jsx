import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiHeart, FiShield } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import { CardSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { alertService } from '../../services/alertService';
import { getSeverityColor } from '../../utils/helpers';

const AlertCard = ({ item, type, index, onClick }) => (
  <motion.div
    className={`cursor-pointer rounded-2xl border-l-4 p-5 transition-all hover:shadow-lg ${getSeverityColor(item.severity)}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{item.studentName}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {type === 'allergy' && item.allergy}
          {type === 'condition' && item.condition}
          {type === 'risk' && item.risk}
        </p>
      </div>
      {item.severity && (
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium capitalize dark:bg-slate-800/80">
          {item.severity}
        </span>
      )}
    </div>
    {item.lastIncident && (
      <p className="mt-2 text-xs text-slate-400">Last incident: {item.lastIncident}</p>
    )}
  </motion.div>
);

const HealthAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  if (loading) {
    return (
      <PageTransition>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={fetchAlerts} />
      </PageTransition>
    );
  }

  const sections = [
    { title: 'Allergies', icon: FiAlertTriangle, color: 'text-red-500', data: alerts.allergies, type: 'allergy' },
    { title: 'Chronic Conditions', icon: FiHeart, color: 'text-amber-500', data: alerts.chronicConditions, type: 'condition' },
    { title: 'High Risk Students', icon: FiShield, color: 'text-orange-500', data: alerts.highRiskStudents, type: 'risk' },
  ];

  const hasAlerts = sections.some((section) => section.data?.length > 0);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="glass-card flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${section.color}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{section.data?.length || 0}</p>
                <p className="text-sm text-slate-500">{section.title}</p>
              </div>
            </div>
          ))}
        </div>

        {!hasAlerts ? (
          <EmptyState
            icon={FiShield}
            title="No health alerts"
            description="Students with allergies or medical conditions will appear here."
          />
        ) : (
          sections.map((section) => (
            section.data?.length > 0 && (
              <div key={section.title}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                  {section.title}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.data.map((item, i) => (
                    <AlertCard
                      key={item.id}
                      item={item}
                      type={section.type}
                      index={i}
                      onClick={() => navigate(`/students/${item.studentId}`)}
                    />
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </PageTransition>
  );
};

export default HealthAlerts;
