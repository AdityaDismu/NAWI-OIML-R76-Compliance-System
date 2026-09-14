import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

export default function EnduranceForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const maxCapacity = Number(
    evaluation?.instrument_range?.max_capacity ??
      evaluation?.instrument_range?.max_value ??
      0
  );

  const [cycles, setCycles] = useState("");
  const [testLoad, setTestLoad] = useState(
    Number((maxCapacity * 0.5).toFixed(3))
  );
  const [initialError, setInitialError] = useState("");
  const [finalError, setFinalError] = useState("");
  const [durabilityError, setDurabilityError] = useState("");
  const [operationOk, setOperationOk] = useState("");
  const [result, setResult] = useState(null);

  function resetForm() {
    setCycles("");
    setTestLoad(Number((maxCapacity * 0.5).toFixed(3)));
    setInitialError("");
    setFinalError("");
    setDurabilityError("");
    setOperationOk("");
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const observations = [
      {
        cycles: Number(cycles),
        test_load: Number(testLoad),
        initial_error: Number(initialError),
        final_error: Number(finalError),
        durability_error: Number(durabilityError),
        operation_ok: operationOk === "yes",
      },
    ];

    const invalid =
      !Number.isFinite(Number(cycles)) ||
      !Number.isFinite(Number(testLoad)) ||
      !Number.isFinite(Number(initialError)) ||
      !Number.isFinite(Number(finalError)) ||
      !Number.isFinite(Number(durabilityError));

    if (invalid) {
      setResult({
        status: "ERROR",
        message: "Please complete all endurance test values.",
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
          error?.message || "Unable to execute endurance test.",
      });
    }
  }

  const enduranceApplicable = maxCapacity <= 100;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Endurance Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Verify performance after repeated loading and unloading
          cycles under normal operating conditions.
        </p>

        {!enduranceApplicable && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm font-medium text-amber-300">
              Applicability Notice
            </p>

            <p className="mt-1 text-sm text-slate-400">
              The current instrument has Max =
              {" "}
              {maxCapacity.toFixed(3)} kg. The R76 endurance test is
              applicable only to the specified instrument categories with
              Max not exceeding 100 kg.
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Required Cycles
            </p>

            <p className="mt-1 text-lg font-semibold text-cyan-300">
              100,000
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Recommended Test Load
            </p>

            <p className="mt-1 text-lg font-semibold text-cyan-300">
              50% of Max
            </p>
          </div>

          <div className="rounded-lg border border-border bg-navy p-4">
            <p className="text-xs uppercase text-slate-500">
              Current Max
            </p>

            <p className="mt-1 text-lg font-semibold text-cyan-300">
              {maxCapacity.toFixed(3)} kg
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-panel p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Completed Cycles
              </label>

              <input
                type="number"
                value={cycles}
                onChange={(e) => setCycles(e.target.value)}
                placeholder="e.g. 100000"
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Test Load (kg)
              </label>

              <input
                type="number"
                step="0.001"
                value={testLoad}
                onChange={(e) => setTestLoad(e.target.value)}
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Initial Error
              </label>

              <input
                type="number"
                step="0.001"
                value={initialError}
                onChange={(e) => setInitialError(e.target.value)}
                placeholder="Enter error"
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Final Error
              </label>

              <input
                type="number"
                step="0.001"
                value={finalError}
                onChange={(e) => setFinalError(e.target.value)}
                placeholder="Enter error"
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Durability Error
              </label>

              <input
                type="number"
                step="0.001"
                value={durabilityError}
                onChange={(e) =>
                  setDurabilityError(e.target.value)
                }
                placeholder="Enter error"
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Normal Operation
              </label>

              <select
                value={operationOk}
                onChange={(e) => setOperationOk(e.target.value)}
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white outline-none focus:border-accent"
              >
                <option value="">Select</option>
                <option value="yes">Normal</option>
                <option value="no">Abnormal</option>
              </select>
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
              disabled={executing || !enduranceApplicable}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
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
                  : "Endurance Test Completed"}
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