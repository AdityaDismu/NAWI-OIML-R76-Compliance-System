import { CheckCircle2, XCircle, Calculator } from "lucide-react";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function titleize(key) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CalculationResult({ result }) {
  if (!result) return null;

  const calculation = result.result && typeof result.result === "object"
    ? result.result
    : result;

  const passed = calculation.result === "PASS";
  const observations = Array.isArray(calculation.observations)
    ? calculation.observations
    : [];

  const hiddenKeys = new Set(["result", "test_code", "observations", "criterion", "explanation"]);
  const summaryEntries = Object.entries(calculation).filter(
    ([key, value]) => !hiddenKeys.has(key) && typeof value !== "object"
  );

  const observationColumns = Array.from(
    new Set(observations.flatMap((row) => Object.keys(row || {})))
  );

  return (
    <div className={`rounded-xl border p-5 ${passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {passed ? <CheckCircle2 className="h-7 w-7 text-emerald-400" /> : <XCircle className="h-7 w-7 text-red-400" />}
          <div>
            <h2 className={`text-lg font-semibold ${passed ? "text-emerald-400" : "text-red-400"}`}>
              {passed ? "Test Passed" : "Test Failed"}
            </h2>
            <p className="text-sm text-slate-400">{calculation.test_code || "OIML Test"}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${passed ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
          {calculation.result || "—"}
        </span>
      </div>

      {summaryEntries.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryEntries.map(([key, value]) => (
            <div key={key} className="rounded-lg border border-border bg-navy p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{titleize(key)}</p>
              <p className="mt-1 break-words text-sm text-slate-200">{formatValue(value)}</p>
            </div>
          ))}
        </div>
      )}

      {calculation.criterion && (
        <div className="mt-5 rounded-lg border border-border bg-navy p-4">
          <div className="mb-2 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Acceptance Criterion</span>
          </div>
          <p className="font-mono text-sm text-slate-200">{formatValue(calculation.criterion)}</p>
        </div>
      )}

      {calculation.explanation && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Explanation</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{formatValue(calculation.explanation)}</p>
        </div>
      )}

      {observations.length > 0 && observationColumns.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-navy px-4 py-3">
            <h3 className="text-sm font-medium text-white">Calculated Observations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="bg-navy/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>{observationColumns.map((key) => <th key={key} className="whitespace-nowrap px-4 py-3">{titleize(key)}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {observations.map((row, index) => (
                  <tr key={index}>
                    {observationColumns.map((key) => (
                      <td key={key} className="whitespace-nowrap px-4 py-3 text-slate-300">{formatValue(row?.[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
