import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  MinusCircle,
} from "lucide-react";

import Badge from "../ui/Badge";

function getDefinition(test) {
  return (
    test.test_definition ||
    test.test_definitions ||
    null
  );
}

function getTestName(test) {
  const definition = getDefinition(test);

  if (!definition) {
    return "Test";
  }

  return (
    definition.name ||
    definition.title ||
    definition.code
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ) ||
    "Test"
  );
}

function getStatusIcon(test) {
  if (test.applicability !== true) {
    return (
      <MinusCircle
        size={19}
        className="text-slate-600"
      />
    );
  }

  switch (test.status) {
    case "COMPLETE":
      return (
        <CheckCircle2
          size={19}
          className="text-emerald-400"
        />
      );

    case "IN_PROGRESS":
      return (
        <Clock3
          size={19}
          className="text-amber-400"
        />
      );

    default:
      return (
        <Circle
          size={19}
          className="text-slate-600"
        />
      );
  }
}

function getDisplayStatus(test) {
  if (test.applicability !== true) {
    return "NOT APPLICABLE";
  }

  if (test.status === "COMPLETE") {
    return "COMPLETE";
  }

  if (test.status === "IN_PROGRESS") {
    return "IN PROGRESS";
  }

  return "NOT TESTED";
}

export default function TestListItem({
  test,
  index,
  onOpen,
}) {
  const definition = getDefinition(test);
  const applicable = test.applicability === true;
  const displayStatus = getDisplayStatus(test);

  return (
    <button
      type="button"
      onClick={() =>
        applicable && onOpen(test)
      }
      disabled={!applicable}
      className={[
        "group flex w-full items-center gap-4 border-b border-slate-800/70 px-5 py-4 text-left transition last:border-0",
        applicable
          ? "hover:bg-slate-900/70"
          : "cursor-not-allowed opacity-60",
      ].join(" ")}
    >
      {/* Number */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-medium text-slate-500">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Status Icon */}
      <div className="shrink-0">
        {getStatusIcon(test)}
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-white">
            {getTestName(test)}
          </p>

          {definition?.code && (
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {definition.code}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-500">
          {test.applicability_reason ||
            (applicable
              ? "Applicable to this instrument."
              : "This test is not applicable to this instrument.")}
        </p>
      </div>

      {/* Status */}
      <div className="hidden shrink-0 sm:block">
        <Badge
          variant={
            displayStatus === "COMPLETE"
              ? "success"
              : displayStatus === "IN PROGRESS"
                ? "warning"
                : "neutral"
          }
        >
          {displayStatus}
        </Badge>
      </div>

      {/* Arrow */}
      {applicable && (
        <ChevronRight
          size={17}
          className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-400"
        />
      )}
    </button>
  );
}