import { useCallback, useEffect, useState } from "react";
import {
  getTestInstance,
  executeTest,
  startTest,
} from "../api/tests";

export function useTest(testInstanceId) {
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const loadTest = useCallback(async () => {
    if (!testInstanceId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getTestInstance(testInstanceId);

      setTest(data);

      // If the backend includes a previously saved result,
      // keep it available when the page is opened again.
      if (data?.result) {
        setResult(data.result);
      } else if (data?.saved_result) {
        setResult(data.saved_result);
      }
    } catch (err) {
      setError(err.message || "Failed to load test");
    } finally {
      setLoading(false);
    }
  }, [testInstanceId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const start = async () => {
    try {
      setStarting(true);
      setError(null);

      const data = await startTest(testInstanceId);

      setTest((current) => ({
        ...current,
        ...data,
      }));

      return data;
    } catch (err) {
      setError(err.message || "Failed to start test");
      throw err;
    } finally {
      setStarting(false);
    }
  };

  const execute = async (data) => {
    try {
      setExecuting(true);
      setError(null);

      const response = await executeTest(testInstanceId, data);

      // IMPORTANT:
      // The backend returns the complete calculation result here.
      setResult(response);

      if (response?.saved_result) {
        setTest((current) => ({
          ...current,
          status: "COMPLETE",
          result: response.result?.result,
        }));
      }

      return response;
    } catch (err) {
      setError(err.message || "Test execution failed");
      throw err;
    } finally {
      setExecuting(false);
    }
  };

  return {
    test,
    result,
    loading,
    executing,
    starting,
    error,
    reload: loadTest,
    start,
    execute,
  };
}