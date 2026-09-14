import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const initialRows = [
  { id: 1, temperature: "-10", zero_change: "" },
  { id: 2, temperature: "5", zero_change: "" },
  { id: 3, temperature: "20", zero_change: "" },
  { id: 4, temperature: "40", zero_change: "" },
];

export default function TemperatureForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const e = Number(
    evaluation?.instrument_range?.verification_scale_interval ?? 0.05
  );

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
      temperature: Number(row.temperature),
      zero_change: Number(row.zero_change),
      verification_scale_interval: e,
      accuracy_class:
        evaluation?.instrument?.accuracy_class || "Class III",
    }));

    if (
      observations.some(
        (row) =>
          !Number.isFinite(row.temperature) ||
          !Number.isFinite(row.zero_change)
      )
    ) {
      setResult({
        status: "ERROR",
        message: "Please enter all temperature and zero-change values.",
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
          error?.message || "Unable to execute temperature test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Static Temperature Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record the zero indication variation at the required
          temperature points after temperature stabilization.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-navy p-4">
          <p className="text-xs uppercase text-slate-500">
            Verification Scale Interval
          </p>

          <p className="mt-1 font-semibold text-cyan-300">
            {e.toFixed(3)} kg
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-5 py-3 text-xs uppercase text-slate-400">
                    Temperature (°C)
                  </th>
                  <th className="px-5 py-3 text-xs uppercase text-slate-400">
                    Zero Change
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.temperature}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "temperature",
                            e.target.value
                          )
                        }
                        className="w-40 rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        step="0.001"
                        value={row.zero_change}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "zero_change",
                            e.target.value
                          )
                        }
                        placeholder="Enter zero change"
                        className="w-48 rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                      />
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
                  : "Temperature Test Completed"}
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