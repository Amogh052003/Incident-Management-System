export function buildEdges(graph = {}) {
  const edges = [];

  Object.entries(graph).forEach(
    ([source, targets]) => {
      targets.forEach((target) => {
        edges.push({
          id: `${source}-${target}`,
          source,
          target,
          animated: true,
        });
      });
    }
  );

  return edges;
}
