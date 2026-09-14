import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

export default function DiscriminationForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const d = Number(
    evaluation?.instrument_range?.actual_scale_interval ??
      evaluation?.instrument_range?.d_value ??
      0.01
  );

  const maxCapacity = Number(
    evaluation?.instrument_range?.max_capacity ??
      evaluation?.instrument_range?.max_value ??
      0
  );

  const [rows, setRows] = useState([
    {
      id: 1,
      load_value: Number((maxCapacity * 0.1).toFixed(3)),
      initial_indication: "",
      reduced_indication: "",
      final_indication: "",
    },
    {
      id: 2,
      load_value: Number((maxCapacity * 0.5).toFixed(3)),
      initial_indication: "",
      reduced_indication: "",
      final_indication: "",
    },
    {
      id: 3,
      load_value: Number(maxCapacity.toFixed(3)),
      initial_indication: "",
      reduced_indication: "",
      final_indication: "",
    },
  ]);

  const [result, setResult] = useState(null);

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  function resetForm() {
    setRows([
      {
        id: 1,
        load_value: Number((maxCapacity * 0.1).toFixed(3)),
        initial_indication: "",
        reduced_indication: "",
        final_indication: "",
      },
      {
        id: 2,
        load_value: Number((maxCapacity * 0.5).toFixed(3)),
        initial_indication: "",
        reduced_indication: "",
        final_indication: "",
      },
      {
        id: 3,
        load_value: Number(maxCapacity.toFixed(3)),
        initial_indication: "",
        reduced_indication: "",
        final_indication: "",
      },
    ]);

    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const observations = rows.map((row) => ({
      load_value: Number(row.load_value),
      initial_indication: Number(row.initial_indication),
      reduced_indication: Number(row.reduced_indication),
      final_indication: Number(row.final_indication),
    }));

    const invalid = observations.some((row) =>
      Object.values(row).some(
        (value) => !Number.isFinite(value)
      )
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please complete all indication values.",
      });
      return;
    }

    try {
      const response = await execute({
        observations,
        parameters: {
          actual_scale_interval: d,
        },
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message || "Unable to execute discrimination test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="text-base font-semibold text-white">
          Discrimination Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Apply the test load, reduce the indication, then add the
          specified small additional load and record the final indication.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Actual Scale Interval (d)
            </p>
            <p className="mt-1 text-lg font-semibold text-cyan-300">
              {d.toFixed(3)} kg
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Additional Load
            </p>
            <p className="mt-1 text-lg font-semibold text-cyan-300">
              {(d / 10).toFixed(4)} kg
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-white">
              Test Observations
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Load
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Initial
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Reduced
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Final
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.001"
                        value={row.load_value}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "load_value",
                            e.target.value
                          )
                        }
                        className="w-32 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    {[
                      "initial_indication",
                      "reduced_indication",
                      "final_indication",
                    ].map((field) => (
                      <td key={field} className="px-4 py-4">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="Enter value"
                          value={row[field]}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              field,
                              e.target.value
                            )
                          }
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
                  : "Discrimination Test Completed"}
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