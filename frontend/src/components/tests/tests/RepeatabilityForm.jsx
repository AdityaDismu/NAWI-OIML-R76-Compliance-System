import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

function createRows(count, defaultLoad) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    load_value: defaultLoad,
    indication_value: "",
  }));
}

export default function RepeatabilityForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const maxCapacity = Number(
    evaluation?.instrument_range?.max_capacity ??
      evaluation?.instrument_range?.max_value ??
      0
  );

  const accuracyClass =
    evaluation?.instrument?.accuracy_class ||
    evaluation?.instrument?.class ||
    "Class III";

  const [loadPercentage, setLoadPercentage] = useState(80);

  const [rows, setRows] = useState(() =>
    createRows(3, Number((maxCapacity * 0.8).toFixed(3)))
  );

  const [result, setResult] = useState(null);

  const loadValue = useMemo(
    () => Number((maxCapacity * (loadPercentage / 100)).toFixed(3)),
    [maxCapacity, loadPercentage]
  );

  function updateLoadPercentage(value) {
    const percentage = Number(value);

    setLoadPercentage(percentage);

    const newLoad = Number(
      (maxCapacity * (percentage / 100)).toFixed(3)
    );

    setRows((current) =>
      current.map((row) => ({
        ...row,
        load_value: newLoad,
      }))
    );
  }

  function updateIndication(id, value) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              indication_value: value,
            }
          : row
      )
    );
  }

  function resetForm() {
    const newLoad = Number(
      (maxCapacity * 0.8).toFixed(3)
    );

    setLoadPercentage(80);
    setRows(createRows(3, newLoad));
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const observations = rows.map((row) => ({
      load_value: Number(row.load_value),
      indication_value: Number(row.indication_value),
    }));

    const invalid = observations.some(
      (row) =>
        !Number.isFinite(row.load_value) ||
        !Number.isFinite(row.indication_value)
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please enter an indication value for every weighing.",
      });
      return;
    }

    try {
      const response = await execute({
        observations,
        parameters: {
          load_percentage: loadPercentage,
          series: 1,
          accuracy_class: accuracyClass,
        },
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message || "Unable to execute the repeatability test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Test setup */}
      <div className="rounded-xl border border-border bg-panel p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">
            Repeatability Test Setup
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Perform repeated weighings using approximately 80% of Max for
            verification. Record the indication for each weighing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Test Load
            </label>

            <select
              value={loadPercentage}
              onChange={(event) =>
                updateLoadPercentage(event.target.value)
              }
              className="w-full rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
            >
              <option value={50}>50% of Max</option>
              <option value={80}>80% of Max</option>
              <option value={100}>100% of Max</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Maximum Capacity
            </label>

            <div className="rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-slate-300">
              {maxCapacity.toFixed(3)} kg
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Actual Test Load
            </label>

            <div className="rounded-lg border border-border bg-navy px-3 py-2.5 text-sm font-medium text-cyan-300">
              {loadValue.toFixed(3)} kg
            </div>
          </div>
        </div>
      </div>

      {/* Observation table */}
      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-white">
              Repeated Weighings
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Record the displayed indication after each repeated weighing.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-border bg-navy">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Weighing
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Applied Load (kg)
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Indication (kg)
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-300">
                        {row.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        step="0.001"
                        value={row.load_value}
                        onChange={(event) => {
                          const value = event.target.value;

                          setRows((current) =>
                            current.map((item) =>
                              item.id === row.id
                                ? {
                                    ...item,
                                    load_value: value,
                                  }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="Enter indication"
                        value={row.indication_value}
                        onChange={(event) =>
                          updateIndication(
                            row.id,
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="submit"
              disabled={executing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {executing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Repeatability Test
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl border p-5 ${
            result.status === "ERROR"
              ? "border-red-500/30 bg-red-500/5"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.status !== "ERROR" && (
              <CheckCircle2
                size={22}
                className="mt-0.5 text-emerald-400"
              />
            )}

            <div>
              <h3 className="font-semibold text-white">
                {result.status === "ERROR"
                  ? "Test Error"
                  : "Repeatability Test Completed"}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {result.message ||
                  result.result ||
                  "The backend has processed the observations."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}