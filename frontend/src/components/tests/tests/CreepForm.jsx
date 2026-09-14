import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

export default function CreepForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const e = Number(
    evaluation?.instrument_range?.verification_scale_interval ??
      0.05
  );

  const [indication0, setIndication0] = useState("");
  const [indication15, setIndication15] = useState("");
  const [indication30, setIndication30] = useState("");
  const [indication4h, setIndication4h] = useState("");

  const [mpe, setMpe] = useState("0.075");

  const [result, setResult] = useState(null);

  function resetForm() {
    setIndication0("");
    setIndication15("");
    setIndication30("");
    setIndication4h("");
    setMpe("0.075");
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const values = {
      indication_0: Number(indication0),
      indication_15: Number(indication15),
      indication_30: Number(indication30),
      mpe: Number(mpe),
    };

    if (
      !Number.isFinite(values.indication_0) ||
      !Number.isFinite(values.indication_15) ||
      !Number.isFinite(values.indication_30) ||
      !Number.isFinite(values.mpe)
    ) {
      setResult({
        status: "ERROR",
        message: "Please complete all required readings.",
      });
      return;
    }

    const parameters = {
      ...values,
      verification_scale_interval: e,
    };

    if (indication4h !== "") {
      parameters.indication_4h = Number(indication4h);
    }

    try {
      const response = await execute({
        observations: [],
        parameters,
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message || "Unable to execute creep test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Creep Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Apply a load close to Max and record the indication at the
          beginning, after 15 minutes and after 30 minutes.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Verification Interval
            </p>
            <p className="mt-1 font-semibold text-cyan-300">
              {e.toFixed(3)} kg
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              30 min Limit
            </p>
            <p className="mt-1 font-semibold text-cyan-300">
              0.5e = {(0.5 * e).toFixed(3)} kg
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              15–30 min Limit
            </p>
            <p className="mt-1 font-semibold text-cyan-300">
              0.2e = {(0.2 * e).toFixed(3)} kg
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-panel p-5">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Indication at 0 min", indication0, setIndication0],
              ["Indication at 15 min", indication15, setIndication15],
              ["Indication at 30 min", indication30, setIndication30],
            ].map(([label, value, setter]) => (
              <div key={label}>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {label}
                </label>

                <input
                  type="number"
                  step="0.001"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="Enter indication"
                  className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                MPE (kg)
              </label>

              <input
                type="number"
                step="0.001"
                value={mpe}
                onChange={(e) => setMpe(e.target.value)}
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Optional 4-hour Indication
              </label>

              <input
                type="number"
                step="0.001"
                value={indication4h}
                onChange={(e) => setIndication4h(e.target.value)}
                placeholder="Only if required"
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between border-t border-border pt-5">
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
                  : "Creep Test Completed"}
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