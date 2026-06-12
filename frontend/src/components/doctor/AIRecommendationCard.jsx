/**
 * AIRecommendationCard.jsx
 *
 * Renders a structured AI medicine recommendation.
 *
 * Expected prop shape (matches backend JSON exactly):
 * {
 *   possibleCondition:    string
 *   reasoning:            string
 *   recommendedMedicines: [{ name, dosage, purpose }]
 *   medicinesToAvoid:     [{ name, reason }]
 *   urgencyLevel:         "low" | "moderate" | "high" | "emergency"
 *   disclaimer:           string
 * }
 */

const URGENCY_STYLES = {
  low:       'bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-300  dark:border-green-800',
  moderate:  'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  high:      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  emergency: 'bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-300    dark:border-red-800',
};

const CARD_BORDER = {
  low:       'border-green-200  dark:border-green-800',
  moderate:  'border-yellow-200 dark:border-yellow-800',
  high:      'border-orange-200 dark:border-orange-800',
  emergency: 'border-red-300    dark:border-red-700',
};

const AIRecommendationCard = ({ recommendation, patient }) => {
  if (!recommendation) return null;

  const {
    possibleCondition,
    reasoning,
    recommendedMedicines = [],
    medicinesToAvoid     = [],
    urgencyLevel         = 'low',
    disclaimer,
  } = recommendation;

  // Normalise to lowercase so the style maps always hit
  const level = (urgencyLevel || 'low').toLowerCase();
  const urgencyStyle = URGENCY_STYLES[level] || URGENCY_STYLES.low;
  const cardBorder   = CARD_BORDER[level]    || CARD_BORDER.low;
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : null;

  return (
    <div className={`rounded-2xl border-2 bg-white p-6 shadow-sm dark:bg-slate-800 ${cardBorder}`}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          🤖 AI Recommendation
        </h2>
        {patientName && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {patientName} {patient?.studentId ? `(${patient.studentId})` : ''}
          </p>
        )}
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${urgencyStyle}`}>
          {urgencyLevel || 'low'}
        </span>
      </div>

      {/* ── Possible condition ───────────────────────────────────────── */}
      {possibleCondition && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Possible Condition
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
            {possibleCondition}
          </p>
        </div>
      )}

      {/* ── Reasoning ───────────────────────────────────────────────── */}
      {reasoning && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Reasoning
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {reasoning}
          </p>
        </div>
      )}

      {/* ── Recommended medicines ─────────────────────────────────────── */}
      {recommendedMedicines.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Recommended Medicines
          </p>
          <ul className="space-y-2">
            {recommendedMedicines.map((med, i) => (
              <li
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50"
              >
                <span className="font-medium text-slate-900 dark:text-white">{med.name}</span>
                {med.dosage  && <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">— {med.dosage}</span>}
                {med.purpose && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{med.purpose}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Medicines to avoid ────────────────────────────────────────── */}
      {medicinesToAvoid.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Medicines to Avoid
          </p>
          <ul className="space-y-2">
            {medicinesToAvoid.map((med, i) => (
              <li
                key={i}
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20"
              >
                <span className="font-medium text-red-800 dark:text-red-300">{med.name}</span>
                {med.reason && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{med.reason}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      {disclaimer && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            ⚠️ {disclaimer}
          </p>
        </div>
      )}

    </div>
  );
};

export default AIRecommendationCard;
