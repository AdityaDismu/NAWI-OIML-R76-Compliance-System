export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-panel/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon size={22} />
        </div>
      )}

      <h3 className="mt-4 font-semibold text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}