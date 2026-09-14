import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const defaultRows = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  equilibrium_stable: "",
  indicated_value: "",
  print_or_storage_ok: "",
  zero_tare_ok: "",
}));

export default function StabilityForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const [rows, setRows] = useState(defaultRows);
  const [result, setResult] = useState(null);

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  function resetForm() {
    setRows(defaultRows);
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const observations = rows.map((row) => ({
      repetition: row.id,
      equilibrium_stable: row.equilibrium_stable === "yes",
      indicated_value:
        row.indicated_value === ""
          ? null
          : Number(row.indicated_value),
      print_or_storage_ok:
        row.print_or_storage_ok === "yes",
      zero_tare_ok: row.zero_tare_ok === "yes",
    }));

    try {
      const response = await execute({
        observations,
        parameters: {
          repetitions: 5,
        },
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message ||
          "Unable to execute stability of equilibrium test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Stability of Equilibrium
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Perform the equilibrium disturbance procedure and verify that
          printing, data storage, zero and tare functions do not operate
          before stable equilibrium is reached.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Trial
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Stable Equilibrium
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Indicated Value
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Print / Storage
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Zero / Tare
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
                      {row.id}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.equilibrium_stable}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "equilibrium_stable",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Stable</option>
                        <option value="no">Not Stable</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.001"
                        value={row.indicated_value}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "indicated_value",
                            e.target.value
                          )
                        }
                        className="w-36 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.print_or_storage_ok}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "print_or_storage_ok",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Correct</option>
                        <option value="no">Incorrect</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.zero_tare_ok}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "zero_tare_ok",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Correct</option>
                        <option value="no">Incorrect</option>
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
              <CheckCircle2
                size={22}
                className="text-emerald-400"
              />
            )}

            <div>
              <h3 className="font-semibold text-white">
                {result.status === "ERROR"
                  ? "Test Error"
                  : "Stability Test Completed"}
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