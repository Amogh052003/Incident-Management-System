/**
 * Converts a dependency graph into animated React Flow edges.
 *
 * @param {Object} [graph={}] - Dependency targets keyed by source ID.
 * @returns {Array<Object>} React Flow edge definitions.
 */
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
