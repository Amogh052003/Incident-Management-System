const express = require("express");
const { updateStatus } = require("../services/workflowService");

const router = express.Router();

const VALID_STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];

router.post("/:id/status", async (req, res) => {
  try {
    const { status, rca } = req.body;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).send("Invalid work item ID");
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).send(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    if (rca) {
      if (typeof rca !== "object" || Array.isArray(rca)) {
        return res.status(400).send("rca must be an object");
      }
      if (status === "RESOLVED") {
        if (!rca.root_cause || !rca.fix || !rca.prevention) {
          return res.status(400).send("root_cause, fix, and prevention are required when resolving");
        }
      }
    }

    await updateStatus(id, status, { rca });

    res.send("Status updated");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;