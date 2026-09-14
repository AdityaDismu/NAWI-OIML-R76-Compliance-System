import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const initialRows = [
  {
    id: 1,
    voltage: "",
    load_value: "",
    error: "",
    mpe: "",
    function_ok: "",
  },
  {
    id: 2,
    voltage: "",
    load_value: "",
    error: "",
    mpe: "",
    function_ok: "",
  },
  {
    id: 3,
    voltage: "",
    load_value: "",
    error: "",
    mpe: "",
    function_ok: "",
  },
  {
    id: 4,
    voltage: "",
    load_value: "",
    error: "",
    mpe: "",
    function_ok: "",
  },
];

export default function VoltageForm({
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
      voltage: Number(row.voltage),
      load_value: Number(row.load_value),
      error: Number(row.error),
      mpe: Number(row.mpe),
      function_ok: row.function_ok === "yes",
    }));

    const invalid = observations.some((row) =>
      !Number.isFinite(row.voltage) ||
      !Number.isFinite(row.load_value) ||
      !Number.isFinite(row.error) ||
      !Number.isFinite(row.mpe)
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please complete all voltage test readings.",
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
          error?.message || "Unable to execute voltage variation test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Voltage Variation Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record the instrument response at the required supply voltage
          levels and test loads.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Voltage
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Load
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Error
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    MPE
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Function
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    {["voltage", "load_value", "error", "mpe"].map(
                      (field) => (
                        <td key={field} className="px-4 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={row[field]}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                field,
                                e.target.value
                              )
                            }
                            placeholder="Enter value"
                            className="w-36 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                          />
                        </td>
                      )
                    )}

                    <td className="px-4 py-4">
                      <select
                        value={row.function_ok}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "function_ok",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">OK</option>
                        <option value="no">Not OK</option>
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
                  : "Voltage Variation Test Completed"}
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