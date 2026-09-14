export default function Select({
  label,
  children,
  className = "",
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-slate-300">
          {label}
        </span>
      )}

      <select
        {...props}
        className={`w-full rounded-xl border border-border bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent ${className}`}
      >
        {children}
      </select>
    </label>
  );
}