import { useCallback, useEffect, useState } from "react";

import {
  getEvaluations,
  getEvaluation,
  getEvaluationTests,
  createEvaluation,
  finalizeEvaluation,
} from "../api/evaluations";


export function useEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEvaluations();

      setEvaluations(data.evaluations || []);
    } catch (err) {
      setError(err.message || "Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  return {
    evaluations,
    loading,
    error,
    reload: loadEvaluations,
  };
}


export function useEvaluation(id) {
  const [evaluation, setEvaluation] = useState(null);
  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [evaluationData, testsData] =
        await Promise.all([
          getEvaluation(id),
          getEvaluationTests(id),
        ]);

      setEvaluation(evaluationData);
      setTests(testsData.tests || []);
    } catch (err) {
      setError(
        err.message || "Failed to load evaluation"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (data) => {
    return createEvaluation(data);
  };

  const finalize = async () => {
    const result = await finalizeEvaluation(id);

    await load();

    return result;
  };

  return {
    evaluation,
    tests,
    loading,
    error,
    reload: load,
    create,
    finalize,
  };
}