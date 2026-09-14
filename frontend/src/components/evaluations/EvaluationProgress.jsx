import {
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";

import Card from "../ui/Card";

export default function EvaluationProgress({
  tests,
}) {
  const applicableTests = tests.filter(
    (test) => test.applicability === true
  );

  const completed = applicableTests.filter(
    (test) => test.status === "COMPLETE"
  ).length;

  const inProgress = applicableTests.filter(
    (test) => test.status === "IN_PROGRESS"
  ).length;

  const total = applicableTests.length;

  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Evaluation Progress
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {completed} of {total} applicable tests completed
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2
              size={15}
              className="text-emerald-400"
            />
            {completed} Complete
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3
              size={15}
              className="text-amber-400"
            />
            {inProgress} In Progress
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Circle
              size={15}
              className="text-slate-600"
            />
            {total - completed - inProgress} Remaining
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-500">
            Completion
          </span>

          <span className="font-medium text-cyan-400">
            {percentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
}