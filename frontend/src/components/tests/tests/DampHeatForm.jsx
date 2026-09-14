import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const initialRows = [
  {
    id: 1,
    temperature: "",
    humidity: "",
    duration_hours: "",
    condition_ok: "",
    performance_ok: "",
    remarks: "",
  },
];

export default function DampHeatForm({
  test,
  evaluation,
  execute,
  executing,
}) {
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
      humidity: Number(row.humidity),
      duration_hours: Number(row.duration_hours),
      condition_ok: row.condition_ok === "yes",
      performance_ok: row.performance_ok === "yes",
      remarks: row.remarks,
    }));

    const invalid = observations.some(
      (row) =>
        !Number.isFinite(row.temperature) ||
        !Number.isFinite(row.humidity) ||
        !Number.isFinite(row.duration_hours)
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please complete the environmental test conditions.",
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
          error?.message || "Unable to execute damp heat test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Damp Heat Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record the environmental chamber conditions and verify that the
          instrument continues to perform correctly under damp heat
          conditions.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-navy p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Typical Reference Condition
          </p>

          <p className="mt-1 text-sm text-slate-300">
            Elevated temperature and approximately 85% relative humidity,
            as applicable to the instrument.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Temperature °C
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Humidity %RH
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Duration (h)
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Chamber Condition
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Performance
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4">
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
                        placeholder="°C"
                        className="w-32 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.humidity}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "humidity",
                            e.target.value
                          )
                        }
                        placeholder="%RH"
                        className="w-32 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.duration_hours}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "duration_hours",
                            e.target.value
                          )
                        }
                        placeholder="Hours"
                        className="w-32 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.condition_ok}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "condition_ok",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Within Condition</option>
                        <option value="no">Outside Condition</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.performance_ok}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "performance_ok",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Pass</option>
                        <option value="no">Fail</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "remarks",
                            e.target.value
                          )
                        }
                        placeholder="Remarks"
                        className="w-56 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
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
              <CheckCircle2
                size={22}
                className="text-emerald-400"
              />
            )}

            <div>
              <h3 className="font-semibold text-white">
                {result.status === "ERROR"
                  ? "Test Error"
                  : "Damp Heat Test Completed"}
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