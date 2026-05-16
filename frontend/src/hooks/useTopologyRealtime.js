import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = window.location.origin;

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
