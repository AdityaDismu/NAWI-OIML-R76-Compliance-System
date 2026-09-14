import Card from "../ui/Card";

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-600">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div className="rounded-xl bg-teal-500/10 p-3 text-teal-400">
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  );
}