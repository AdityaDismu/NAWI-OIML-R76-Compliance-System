import { useCallback, useEffect, useState } from "react";
import { getInstruments } from "../api/instruments";

export function useInstruments() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInstruments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInstruments();

      setInstruments(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load instruments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstruments();
  }, [loadInstruments]);

  return {
    instruments,
    loading,
    error,
    reload: loadInstruments,
  };
}