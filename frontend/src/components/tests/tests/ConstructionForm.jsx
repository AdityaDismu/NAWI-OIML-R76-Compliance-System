import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

const initialRows = [
  {
    id: 1,
    item: "Manufacturer identification",
    requirement: "Manufacturer or trademark is clearly identified.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 2,
    item: "Model / type designation",
    requirement: "Model or type designation is clearly marked.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 3,
    item: "Serial number",
    requirement: "Unique serial number is provided.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 4,
    item: "Accuracy class",
    requirement: "Accuracy class marking is provided.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 5,
    item: "Maximum capacity",
    requirement: "Max marking is present and appropriate.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 6,
    item: "Minimum capacity",
    requirement: "Min marking is present and appropriate.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 7,
    item: "Verification scale interval",
    requirement: "e value is correctly marked.",
    observed: "",
    evidence: "",
    compliant: "",
  },
  {
    id: 8,
    item: "Sealing / security",
    requirement: "Required sealing and security provisions are present.",
    observed: "",
    evidence: "",
    compliant: "",
  },
];

export default function ConstructionForm({
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
      item: row.item,
      requirement: row.requirement,
      observed: row.observed,
      evidence: row.evidence,
      compliant: row.compliant === "yes",
    }));

    const incomplete = observations.some(
      (row) =>
        !row.observed.trim() ||
        !row.evidence.trim() ||
        row.compliant === false && row.observed === ""
    );

    if (incomplete) {
      setResult({
        status: "ERROR",
        message:
          "Please complete the observation and evidence fields for every checklist item.",
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
          "Unable to execute construction checklist.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Construction & Administrative Examination
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Verify the instrument construction, markings, documentation,
          sealing and other applicable requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px]">
              <thead>
                <tr className="border-b border-border bg-navy text-left">
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Item
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Requirement
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Observation
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Evidence / Photo Ref.
                  </th>
                  <th className="px-4 py-3 text-xs uppercase text-slate-400">
                    Result
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-white">
                        {row.item}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="max-w-xs text-sm text-slate-400">
                        {row.requirement}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <textarea
                        rows={3}
                        value={row.observed}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "observed",
                            e.target.value
                          )
                        }
                        placeholder="Enter observation"
                        className="w-64 resize-none rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4 align-top">
                      <input
                        type="text"
                        value={row.evidence}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "evidence",
                            e.target.value
                          )
                        }
                        placeholder="Photo / document reference"
                        className="w-64 rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                      />
                    </td>

                    <td className="px-4 py-4 align-top">
                      <select
                        value={row.compliant}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "compliant",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        <option value="yes">Compliant</option>
                        <option value="no">Non-compliant</option>
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
                  Complete Checklist
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
                  ? "Checklist Error"
                  : "Construction Checklist Completed"}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {result.message ||
                  result.result ||
                  "The checklist has been processed."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}