import { STATUS_COLORS } from "./statusColors";

export function buildNodes(state = {}) {
  return Object.entries(state).map(
    ([service, data], index) => ({
      id: service,

      data: {
        label: service,
      },

      position: {
        x: 250 * (index % 3),
        y: 150 * Math.floor(index / 3),
      },

      style: {
        background: STATUS_COLORS[data.status] || STATUS_COLORS.unknown,
        color: "white",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: 10,
        width: 180,
      },
    })
  );
}
