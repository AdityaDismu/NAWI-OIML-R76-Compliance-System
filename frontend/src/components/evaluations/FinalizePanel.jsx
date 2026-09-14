import {
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";

export default function FinalizePanel({
  evaluation,
  tests,
  onFinalize,
  finalizing,
}) {
  const applicable = tests.filter(
    (test) => test.applicability === true
  );

  const incomplete = applicable.filter(
    (test) => test.status !== "COMPLETE"
  );

  const canFinalize =
    evaluation?.status !== "FINALIZED" &&
    incomplete.length === 0;

  if (evaluation?.status === "FINALIZED") {
    return (
      <Card>
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-400/10 p-3">
            <Lock
              size={21}
              className="text-emerald-400"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Evaluation Finalized
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              This evaluation is locked and cannot be
              modified through normal test operations.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={[
              "rounded-xl p-3",
              canFinalize
                ? "bg-emerald-400/10"
                : "bg-amber-400/10",
            ].join(" ")}
          >
            {canFinalize ? (
              <CheckCircle2
                size={21}
                className="text-emerald-400"
              />
            ) : (
              <AlertTriangle
                size={21}
                className="text-amber-400"
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Finalize Evaluation
            </h3>

            {canFinalize ? (
              <p className="mt-1 text-sm text-slate-400">
                All applicable tests are complete.
                The evaluation is ready for finalization.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">
                {incomplete.length} applicable test
                {incomplete.length !== 1 ? "s" : ""}{" "}
                still need
                {incomplete.length === 1 ? "s" : ""}{" "}
                to be completed.
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={onFinalize}
          disabled={!canFinalize || finalizing}
        >
          <Lock size={16} />

          {finalizing
            ? "Finalizing..."
            : "Finalize Evaluation"}
        </Button>
      </div>
    </Card>
  );
}