export function buildEdges(graph = {}) {
  const edges = [];

  Object.entries(graph).forEach(
    ([source, targets]) => {
      targets.forEach((target) => {
        edges.push({
          id: `${target}->${source}`,
          source: target,
          target: source,
          animated: true,
        });
      });
    }
  );

  return edges;
}
