import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const initialRows = [
  {
    id: 1,
    test_type: "AC mains dips / interruptions",
    level: "",
    polarity: "Not applicable",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
  {
    id: 2,
    test_type: "Electrical fast transients / bursts",
    level: "",
    polarity: "",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
  {
    id: 3,
    test_type: "Surge",
    level: "",
    polarity: "",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
  {
    id: 4,
    test_type: "Electrostatic discharge",
    level: "",
    polarity: "",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
  {
    id: 5,
    test_type: "Radiated RF",
    level: "",
    polarity: "",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
  {
    id: 6,
    test_type: "Conducted RF",
    level: "",
    polarity: "",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
  {
    id: 7,
    test_type: "Road vehicle EMC",
    level: "",
    polarity: "",
    repetitions: "",
    disturbance_ok: "",
    remarks: "",
  },
];

export default function EmcForm({
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
      test_type: row.test_type,
      level: row.level,
      polarity: row.polarity,
      repetitions:
        row.repetitions === ""
          ? null
          : Number(row.repetitions),
      disturbance_ok: row.disturbance_ok === "yes",
      remarks: row.remarks,
    }));

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
          error?.message || "Unable to execute EMC test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Electromagnetic Compatibility Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record the applicable EMC disturbance, test level, polarity,
          repetitions and observed response.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    EMC Test
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Level
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Polarity
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Repetitions
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Response
                  </th>

                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-4 font-medium text-white">
                      {row.test_type}
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={row.level}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "level",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 6 kV / 10 V/m"
                        className="w-44 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.polarity}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "polarity",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="Positive">Positive</option>
                        <option value="Negative">Negative</option>
                        <option value="Both">Both</option>
                        <option value="Not applicable">
                          Not applicable
                        </option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={row.repetitions}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "repetitions",
                            e.target.value
                          )
                        }
                        placeholder="Count"
                        className="w-28 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={row.disturbance_ok}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "disturbance_ok",
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
                        className="w-52 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
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
                  Run EMC Test
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
                  : "EMC Test Completed"}
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