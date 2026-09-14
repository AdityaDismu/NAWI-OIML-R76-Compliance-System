import Card from "../ui/Card";
import Badge from "../ui/Badge";

const evaluations = [
  {
    instrument: "PS-150 Digital Platform Scale",
    serial: "PS150-2026-001",
    className: "Class III",
    status: "IN_PROGRESS",
  },
  {
    instrument: "WS-200 Platform Scale",
    serial: "WS200-2026-014",
    className: "Class II",
    status: "FINALIZED",
  },
  {
    instrument: "MS-50 Commercial Scale",
    serial: "MS50-2026-008",
    className: "Class III",
    status: "COMPLETE",
  },
];

export default function RecentEvaluations() {
  return (
    <Card>
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="font-semibold text-white">
          Recent Evaluations
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Latest instrument verification activity
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {evaluations.map((evaluation) => (
          <div
            key={evaluation.serial}
            className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-200">
                {evaluation.instrument}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {evaluation.serial} • {evaluation.className}
              </p>
            </div>

            <Badge value={evaluation.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}