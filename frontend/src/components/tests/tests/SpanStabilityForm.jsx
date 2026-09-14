import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

function createRows() {
  return Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    day: "",
    indication_initial: "",
    indication_load: "",
    zero_reference: "",
    load_reference: "",
  }));
}

export default function SpanStabilityForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const [rows, setRows] = useState(createRows());
  const [result, setResult] = useState(null);

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  function resetForm() {
    setRows(createRows());
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const observations = rows.map((row) => ({
      day: Number(row.day),
      indication_initial: Number(row.indication_initial),
      indication_load: Number(row.indication_load),
      zero_reference: Number(row.zero_reference),
      load_reference: Number(row.load_reference),
    }));

    const invalid = observations.some((row) =>
      Object.values(row).some(
        (value) => !Number.isFinite(value)
      )
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message:
          "Please complete all span stability measurement values.",
      });
      return;
    }

    try {
      const response = await execute({
        observations,
        parameters: {},
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message ||
          "Unable to execute span stability test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Span Stability Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record repeated measurements near the maximum capacity over
          the required stability period.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Measurement Points
            </p>

            <p className="mt-1 text-lg font-semibold text-cyan-300">
              8
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Test Load
            </p>

            <p className="mt-1 text-lg font-semibold text-cyan-300">
              Near Max
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Stability Period
            </p>

            <p className="mt-1 text-lg font-semibold text-cyan-300">
              Up to 28 days
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Measurement
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Day
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Initial Indication
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Load Indication
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Zero Reference
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Load Reference
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-4 font-semibold text-white">
                      #{row.id}
                    </td>

                    {[
                      "day",
                      "indication_initial",
                      "indication_load",
                      "zero_reference",
                      "load_reference",
                    ].map((field) => (
                      <td key={field} className="px-4 py-4">
                        <input
                          type="number"
                          step="0.001"
                          value={row[field]}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              field,
                              e.target.value
                            )
                          }
                          placeholder="Enter value"
                          className="w-40 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="submit"
              disabled={executing}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {executing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Test
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            {result.status !== "ERROR" && (
              <CheckCircle2
                size={22}
                className="text-emerald-400"
              />
            )}

            <div>
              <h3 className="font-semibold text-white">
                {result.status === "ERROR"
                  ? "Test Error"
                  : "Span Stability Test Completed"}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {result.message ||
                  result.result ||
                  "The test has been processed."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}