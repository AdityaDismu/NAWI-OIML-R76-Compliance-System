import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

function createRows() {
  return [
    {
      id: 1,
      gross_load: "",
      tare_value: "",
      gross_indication: "",
      net_indication: "",
      net_reference: "",
    },
    {
      id: 2,
      gross_load: "",
      tare_value: "",
      gross_indication: "",
      net_indication: "",
      net_reference: "",
    },
    {
      id: 3,
      gross_load: "",
      tare_value: "",
      gross_indication: "",
      net_indication: "",
      net_reference: "",
    },
    {
      id: 4,
      gross_load: "",
      tare_value: "",
      gross_indication: "",
      net_indication: "",
      net_reference: "",
    },
    {
      id: 5,
      gross_load: "",
      tare_value: "",
      gross_indication: "",
      net_indication: "",
      net_reference: "",
    },
  ];
}

export default function TareForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const maxTare = Number(
    evaluation?.instrument?.maximum_tare ??
      evaluation?.instrument_range?.maximum_tare ??
      0
  );

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
      gross_load: Number(row.gross_load),
      tare_value: Number(row.tare_value),
      gross_indication: Number(row.gross_indication),
      net_indication: Number(row.net_indication),
      net_reference: Number(row.net_reference),
    }));

    const invalid = observations.some((row) =>
      Object.values(row).some(
        (value) => !Number.isFinite(value)
      )
    );

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please complete all tare test observations.",
      });
      return;
    }

    try {
      const response = await execute({
        observations,
        parameters: {
          maximum_tare: maxTare,
        },
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message || "Unable to execute tare test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Tare Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Test different tare values and verify the accuracy of the net
          weighing result.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-navy p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Maximum Tare
          </p>

          <p className="mt-1 text-lg font-semibold text-cyan-300">
            {maxTare > 0 ? `${maxTare.toFixed(3)} kg` : "Not specified"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-white">
              Tare Observations
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Trial
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Gross Load
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Tare
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Gross Indication
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Net Indication
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Net Reference
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

                    {[
                      "gross_load",
                      "tare_value",
                      "gross_indication",
                      "net_indication",
                      "net_reference",
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
                  : "Tare Test Completed"}
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