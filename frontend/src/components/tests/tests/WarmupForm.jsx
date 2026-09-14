import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const initialRows = [
  { id: 1, elapsed_minutes: 0, zero_error: "", load_error: "", weighing_result_available: "" },
  { id: 2, elapsed_minutes: 5, zero_error: "", load_error: "", weighing_result_available: "" },
  { id: 3, elapsed_minutes: 15, zero_error: "", load_error: "", weighing_result_available: "" },
  { id: 4, elapsed_minutes: 30, zero_error: "", load_error: "", weighing_result_available: "" },
];

export default function WarmupForm({ test, evaluation, execute, executing }) {
  const [rows, setRows] = useState(initialRows);
  const [result, setResult] = useState(null);

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  function resetForm() {
    setRows(initialRows);
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const observations = rows.map((row) => ({
      elapsed_minutes: Number(row.elapsed_minutes),
      zero_error: Number(row.zero_error),
      load_error: Number(row.load_error),
      weighing_result_available:
        row.weighing_result_available === "yes",
    }));

    const invalid = observations.some((row) =>
      !Number.isFinite(row.zero_error) ||
      !Number.isFinite(row.load_error)
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please complete all required readings.",
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
        message: error?.message || "Unable to execute warm-up test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">Warm-up Test</h3>

        <p className="mt-1 text-sm text-slate-400">
          Record zero and loaded errors at the specified time intervals
          after switching on the instrument.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Time
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Zero Error
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Load Error
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Weighing Result Available
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
                      {row.elapsed_minutes} min
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.001"
                        value={row.zero_error}
                        onChange={(e) =>
                          updateRow(row.id, "zero_error", e.target.value)
                        }
                        placeholder="Error"
                        className="w-36 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.001"
                        value={row.load_error}
                        onChange={(e) =>
                          updateRow(row.id, "load_error", e.target.value)
                        }
                        placeholder="Error"
                        className="w-36 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.weighing_result_available}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "weighing_result_available",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
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
              <CheckCircle2 size={22} className="text-emerald-400" />
            )}

            <div>
              <h3 className="font-semibold text-white">
                {result.status === "ERROR"
                  ? "Test Error"
                  : "Warm-up Test Completed"}
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