import { useNavigate, useParams } from "react-router-dom";
import TestWorkspace from "../components/tests/TestWorkspace";
import { useEvaluation } from "../hooks/useEvaluations";
import { useTest } from "../hooks/useTests";

export default function TestExecution() {
  const { id, testId } = useParams();
  const navigate = useNavigate();

  const {
    evaluation,
    loading: evaluationLoading,
  } = useEvaluation(id);

  const {
    test,
    result,
    loading: testLoading,
    executing,
    error,
    execute,
  } = useTest(testId);

  return (
    <TestWorkspace
      test={test}
      evaluation={evaluation}
      result={result}
      loading={evaluationLoading || testLoading}
      executing={executing}
      error={error}
      execute={execute}
      onBack={() => navigate(`/evaluations/${id}`)}
    />
  );
}