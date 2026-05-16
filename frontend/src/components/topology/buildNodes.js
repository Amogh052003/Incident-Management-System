import dagre from "dagre";
import { STATUS_COLORS } from "./statusColors";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

export function buildNodes(state = {}, graph = {}) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 150, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  Object.keys(state).forEach((id) => {
    g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  Object.entries(graph).forEach(([source, targets]) => {
    targets.forEach((target) => {
      g.setEdge(target, source);
    });
  });

  dagre.layout(g);

  return Object.keys(state).map((id) => {
    const node = g.node(id);
    return {
      id,
      data: { label: id },
      position: {
        x: node.x - NODE_WIDTH / 2,
        y: node.y - NODE_HEIGHT / 2,
      },
      style: {
        background: STATUS_COLORS[state[id]?.status] || STATUS_COLORS.unknown,
        color: "white",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: 10,
        width: NODE_WIDTH,
      },
    };
  });
}
