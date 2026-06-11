const FormTextarea = ({ label, name, register, error, placeholder, rows = 4, required }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
    )}
    <textarea
      id={name}
      rows={rows}
      placeholder={placeholder}
      {...register(name)}
      className={`w-full rounded-xl border bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 dark:bg-slate-800/80 dark:text-white ${
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-200 focus:border-health-500 focus:ring-health-500/20 dark:border-slate-700'
      }`}
    />
    {error && <p className="text-xs text-red-500">{error.message}</p>}
  </div>
);

export default FormTextarea;
