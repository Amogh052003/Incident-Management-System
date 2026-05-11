import { useEffect } from "react";

import { io } from "socket.io-client";

export function useTopologyRealtime(
  setNodes,
  buildNodes
) {
  useEffect(() => {
    const socket = io(
      "http://localhost:3000"
    );

    socket.on(
      "incident.created",
      async () => {
        console.log(
          "[SOCKET] incident.created"
        );

        const response = await fetch(
          "http://localhost:3000/topology"
        );

        const data = await response.json();

        setNodes(
          buildNodes(data.state)
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);
}