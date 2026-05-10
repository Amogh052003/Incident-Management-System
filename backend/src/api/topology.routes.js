const express = require("express");

const {
  getTopologyGraph,
  getTopologyState,
} = require("../core/topology/topologyServices");

const router = express.Router();

router.get("/topology", (req, res) => {
  res.json({
    graph: getTopologyGraph(),
    state: getTopologyState(),
  });
});

module.exports = router;