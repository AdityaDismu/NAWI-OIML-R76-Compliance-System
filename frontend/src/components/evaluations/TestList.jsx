import Card from "../ui/Card";

import TestListItem from "./TestListItem";


export default function TestList({
  tests,
  onOpen,
}) {

  return (
    <Card className="overflow-hidden p-0">

      <div className="border-b border-slate-800 px-5 py-4">

        <h2 className="text-sm font-semibold text-white">
          Compliance Tests
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Tests determined automatically from the
          instrument configuration and applicability rules.
        </p>

      </div>


      {tests.length === 0 ? (

        <div className="px-5 py-12 text-center text-sm text-slate-500">
          No test instances found for this evaluation.
        </div>

      ) : (

        <div>

          {tests.map(
            (test, index) => (
              <TestListItem
                key={test.id}
                test={test}
                index={index}
                onOpen={onOpen}
              />
            )
          )}

        </div>

      )}

    </Card>
  );
}