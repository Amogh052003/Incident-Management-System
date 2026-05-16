import { useEffect, useState } from "react";
import { useTopologyRealtime } from "../hooks/useTopologyRealtime";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { buildNodes } from "./topology/buildNodes";
import { buildEdges } from "./topology/buildEdges";

export default function TopologyGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    async function loadTopology() {
      try {
        const response = await fetch("/topology");
        const data = await response.json();
        const builtNodes = buildNodes(data.state, data.graph);
        const builtEdges = buildEdges(data.graph);
        setNodes(builtNodes);
        setEdges(builtEdges);
      } catch (err) {
        console.error("Failed to load topology", err);
      }
    }
    loadTopology();
  }, []);

  useTopologyRealtime(setNodes, setEdges, buildNodes, buildEdges);

  return (
    <div className="topology-container">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
