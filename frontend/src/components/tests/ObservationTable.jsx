import { Plus, Trash2 } from "lucide-react";

export default function ObservationTable({
  observations,
  onChange,
  onAdd,
  onRemove,
}) {
  function updateRow(index, field, value) {
    const updated = [...observations];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    onChange(updated);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-panel px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">
            Observations
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Enter the readings recorded during the test.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
        >
          <Plus className="h-4 w-4" />
          Add Observation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-border bg-navy/70">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">
                #
              </th>

              <th className="px-5 py-3">
                Load (kg)
              </th>

              <th className="px-5 py-3">
                Indication (kg)
              </th>

              <th className="px-5 py-3">
                ΔL (kg)
              </th>

              <th className="w-12 px-3 py-3">
                {" "}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {observations.map((observation, index) => (
              <tr key={index}>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {index + 1}
                </td>

                <td className="px-5 py-3">
                  <input
                    type="number"
                    step="0.001"
                    value={observation.load_value}
                    onChange={(event) =>
                      updateRow(
                        index,
                        "load_value",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    placeholder="0.000"
                  />
                </td>

                <td className="px-5 py-3">
                  <input
                    type="number"
                    step="0.001"
                    value={observation.indication_value}
                    onChange={(event) =>
                      updateRow(
                        index,
                        "indication_value",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    placeholder="0.000"
                  />
                </td>

                <td className="px-5 py-3">
                  <input
                    type="number"
                    step="0.001"
                    value={observation.delta_load}
                    onChange={(event) =>
                      updateRow(
                        index,
                        "delta_load",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-navy px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    placeholder="0.000"
                  />
                </td>

                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={observations.length <= 1}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove observation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}