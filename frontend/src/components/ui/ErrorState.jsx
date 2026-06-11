import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
      <FiAlertCircle className="h-8 w-8 text-red-500" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Error</h3>
    <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl bg-health-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-health-700"
      >
        <FiRefreshCw className="h-4 w-4" />
        Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
