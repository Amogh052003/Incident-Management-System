const express = require("express");

const {
  getTopologyGraph,
  getTopologyState,
} = require("../core/topology/topologyServices");

const router = express.Router();

/**
 * @openapi
 * /topology:
 *   get:
 *     summary: Get service topology
 *     description: Returns the current topology graph and topology state.
 *     responses:
 *       200:
 *         description: Topology graph and state.
 */
router.get("/topology", (req, res) => {
  res.json({
    graph: getTopologyGraph(),
    state: getTopologyState(),
  });
});

module.exports = router;