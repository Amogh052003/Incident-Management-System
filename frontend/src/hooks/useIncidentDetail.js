import { useState, useEffect, useCallback } from "react";

/**
 * Loads an incident and its logs and exposes a status-update operation.
 *
 * @param {*} id - Incident ID used in API paths.
 * @returns {Object} Incident detail state, logs, loading state, update function, and refetch function.
 */
export function useIncidentDetail(id) {
  const [incident, setIncident] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [incRes, logsRes] = await Promise.all([
        fetch(`/incidents/${id}`),
        fetch(`/incidents/${id}/logs?limit=20`),
      ]);
      if (incRes.ok) setIncident(await incRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      console.error("Failed to fetch incident detail", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = async (newStatus, rca) => {
    try {
      const res = await fetch(`/workitem/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...(rca ? { rca } : {}) }),
      });
      if (res.ok) fetchDetail();
      return res.ok;
    } catch (err) {
      console.error("Failed to update status", err);
      return false;
    }
  };

  return { incident, logs, loading, updateStatus, refetch: fetchDetail };
}
