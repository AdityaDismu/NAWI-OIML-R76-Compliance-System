import { BookOpen } from "lucide-react";

export default function TestInstructions({ test }) {
  const definition = test?.test_definition;

  if (!definition) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10">
          <BookOpen className="h-4 w-4 text-cyan-400" />
        </div>

        <div>
          <h2 className="font-semibold text-white">
            Test Instructions
          </h2>

          <p className="text-xs text-slate-500">
            OIML R76 procedure guidance
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-300">
        {definition.description ||
          definition.instructions ||
          "Record the required observations and execute the test. The regulatory engine will perform the compliance calculation."}
      </p>

      {definition.code && (
        <div className="mt-4">
          <span className="rounded-md border border-border bg-navy px-2.5 py-1 font-mono text-xs text-cyan-300">
            {definition.code}
          </span>
        </div>
      )}
    </div>
  );
}