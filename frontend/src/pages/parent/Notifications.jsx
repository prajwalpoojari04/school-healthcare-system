import { FiBell } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import EmptyState from '../../components/ui/EmptyState';

const Notifications = () => (
  <PageTransition>
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
        <p className="text-sm text-slate-500">Stay updated on your child's health</p>
      </div>
      <EmptyState
        icon={FiBell}
        title="No notifications"
        description="There are no notifications at this time. Check back later for health updates."
      />
    </div>
  </PageTransition>
);

export default Notifications;
