import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = window.location.origin;

/**
 * Fetches active incidents and refreshes them when an incident-created socket event arrives.
 *
 * @returns {Object} Incident data, severity counts, loading state, and a refetch function.
 */
export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch("/incidents?status=ACTIVE");
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on("incident.created", fetchIncidents);
    return () => socket.disconnect();
  }, [fetchIncidents]);

  const p0Count = incidents.filter((i) => i.severity === "P0").length;
  const p1Count = incidents.filter((i) => i.severity === "P1").length;
  const totalActive = incidents.length;

  return { incidents, loading, p0Count, p1Count, totalActive, refetch: fetchIncidents };
}
