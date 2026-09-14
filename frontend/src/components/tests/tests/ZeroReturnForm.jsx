import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

export default function ZeroReturnForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const e = Number(
    evaluation?.instrument_range?.verification_scale_interval ??
      0.05
  );

  const [zeroBefore, setZeroBefore] = useState("");
  const [zeroAfter, setZeroAfter] = useState("");
  const [result, setResult] = useState(null);

  function resetForm() {
    setZeroBefore("");
    setZeroAfter("");
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const before = Number(zeroBefore);
    const after = Number(zeroAfter);

    if (!Number.isFinite(before) || !Number.isFinite(after)) {
      setResult({
        status: "ERROR",
        message: "Please enter both zero indications.",
      });
      return;
    }

    try {
      const response = await execute({
        observations: [],
        parameters: {
          zero_before: before,
          zero_after: after,
        },
      });

      setResult(response);
    } catch (error) {
      setResult({
        status: "ERROR",
        message:
          error?.message || "Unable to execute zero return test.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <h3 className="font-semibold text-white">
          Zero Return Test
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record the zero indication before applying the test load and
          after removing the load and allowing the instrument to stabilize.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-navy p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Verification Scale Interval (e)
          </p>

          <p className="mt-1 text-lg font-semibold text-cyan-300">
            {e.toFixed(3)} kg
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Expected zero-return limit is evaluated by the regulatory
            engine.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-panel p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Zero Indication Before Load
              </label>

              <input
                type="number"
                step="0.001"
                value={zeroBefore}
                onChange={(e) => setZeroBefore(e.target.value)}
                placeholder="Enter zero indication"
                className="w-full rounded-lg border border-border bg-navy px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Zero Indication After Load Removal
              </label>

              <input
                type="number"
                step="0.001"
                value={zeroAfter}
                onChange={(e) => setZeroAfter(e.target.value)}
                placeholder="Enter stabilized zero"
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
                  : "Zero Return Test Completed"}
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