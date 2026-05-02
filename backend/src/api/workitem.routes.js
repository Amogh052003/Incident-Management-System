const express = require("express");
const { updateStatus } = require("../services/workflowService");

const router = express.Router();

// update work item status
router.post("/:id/status", async (req, res) => {
  try {
    const { status, rca } = req.body;

    await updateStatus(req.params.id, status, { rca });

    res.send("Status updated");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;