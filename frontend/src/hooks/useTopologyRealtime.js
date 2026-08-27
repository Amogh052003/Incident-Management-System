import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = window.location.origin;

/**
 * Refreshes topology nodes and edges after an incident-created socket event.
 *
 * @param {Function} setNodes - State setter for topology nodes.
 * @param {Function} setEdges - State setter for topology edges.
 * @param {Function} buildNodes - Converts topology state and graph to nodes.
 * @param {Function} buildEdges - Converts the graph to edges.
 */
export function useTopologyRealtime(setNodes, setEdges, buildNodes, buildEdges) {
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("incident.created", async () => {
      const response = await fetch("/topology");
      const data = await response.json();
      setNodes(buildNodes(data.state, data.graph));
      setEdges(buildEdges(data.graph));
    });

    return () => socket.disconnect();
  }, []);
}
