import { useMemo, useState } from "react";
import { Loader2, Play, RotateCcw, Plus, Trash2 } from "lucide-react";

function emptyRow() {
  return { load_value: "", indication_value: "", delta_load: "0" };
}

function Section({ title, rows, setRows, disabled }) {
  function updateRow(index, field, value) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border bg-navy px-5 py-4">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">Record each loading point separately.</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setRows((current) => [...current, emptyRow()])}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus size={14} /> Add row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-border bg-navy/60 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Load (kg)</th>
              <th className="px-4 py-3">Indication (kg)</th>
              <th className="px-4 py-3">ΔL (kg)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                {["load_value", "indication_value", "delta_load"].map((field) => (
                  <td key={field} className="px-4 py-3">
                    <input
                      type="number"
                      step="0.001"
                      value={row[field]}
                      disabled={disabled}
                      onChange={(e) => updateRow(index, field, e.target.value)}
                      className="w-40 rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white outline-none focus:border-accent disabled:opacity-50"
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={disabled || rows.length <= 1}
                    onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400 disabled:opacity-30"
                    aria-label="Remove row"
                  >
                    <Trash2 size={15} />
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

export default function WeighingPerformanceForm({ test, evaluation, execute, executing }) {
  const range = evaluation?.instrument_range || {};
  const max = Number(range.max_capacity ?? range.max_value ?? 0);
  const min = Number(range.min_capacity ?? range.min_value ?? 0);
  const e = Number(range.verification_scale_interval ?? range.e_value ?? 0);
  const d = Number(range.actual_scale_interval ?? range.d_value ?? 0);

  const suggestedLoading = useMemo(() => {
    const values = [min, max / 6, max / 3, (2 * max) / 3, max].filter((v) => Number.isFinite(v) && v > 0);
    return values.map((v) => ({ load_value: v.toFixed(3), indication_value: v.toFixed(3), delta_load: "0" }));
  }, [min, max]);

  const [zeroError, setZeroError] = useState("0");
  const [loadingRows, setLoadingRows] = useState(suggestedLoading);
  const [unloadingRows, setUnloadingRows] = useState(
    [...suggestedLoading].reverse()
  );
  const [localError, setLocalError] = useState("");

  const alreadyComplete = test?.status === "COMPLETE";

  function resetForm() {
    setZeroError("0");
    setLoadingRows(suggestedLoading);
    setUnloadingRows([...suggestedLoading].reverse());
    setLocalError("");
  }

  async function handleExecute(event) {
    event.preventDefault();
    setLocalError("");

    const makeRows = (rows, direction) => rows.map((row) => ({
      load_value: Number(row.load_value),
      indication_value: Number(row.indication_value),
      delta_load: Number(row.delta_load || 0),
      direction,
    }));

    const observations = [
      ...makeRows(loadingRows, "LOADING"),
      ...makeRows(unloadingRows, "UNLOADING"),
    ];

    const invalid = observations.some(
      (row) => !Number.isFinite(row.load_value) || !Number.isFinite(row.indication_value) || !Number.isFinite(row.delta_load)
    );

    if (invalid || observations.length === 0) {
      setLocalError("Please complete all loading and unloading observations.");
      return;
    }

    try {
      await execute({
        observations,
        parameters: { zero_error: Number(zeroError || 0) },
      });
    } catch (error) {
      setLocalError(error?.message || "Unable to execute weighing performance test.");
    }
  }

  return (
    <form onSubmit={handleExecute} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Parameter label="Maximum Capacity" value={`${max} kg`} />
        <Parameter label="Minimum Capacity" value={`${min} kg`} />
        <Parameter label="Verification Interval (e)" value={`${e} kg`} />
        <Parameter label="Actual Interval (d)" value={`${d} kg`} />
      </div>

      <div className="rounded-xl border border-border bg-panel p-5">
        <label className="mb-2 block text-sm font-medium text-slate-300">Zero Error (E₀)</label>
        <input
          type="number"
          step="0.001"
          value={zeroError}
          disabled={alreadyComplete}
          onChange={(e) => setZeroError(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-border bg-navy px-3 py-2.5 text-sm text-white outline-none focus:border-accent disabled:opacity-50"
        />
      </div>

      <Section title="Loading" rows={loadingRows} setRows={setLoadingRows} disabled={alreadyComplete || executing} />
      <Section title="Unloading" rows={unloadingRows} setRows={setUnloadingRows} disabled={alreadyComplete || executing} />

      {localError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{localError}</div>
      )}

      {!alreadyComplete && (
        <div className="flex justify-end gap-3">
          <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
            <RotateCcw size={16} /> Reset
          </button>
          <button type="submit" disabled={executing} className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {executing ? <><Loader2 size={16} className="animate-spin" /> Calculating...</> : <><Play size={16} /> Run Weighing Performance</>}
          </button>
        </div>
      )}
    </form>
  );
}

function Parameter({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
