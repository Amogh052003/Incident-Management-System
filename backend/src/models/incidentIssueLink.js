const mongoose = require("mongoose");

const incidentIssueLinkSchema = new mongoose.Schema({
  incidentId: { type: String, required: true },
  githubIssue: { type: Number, required: true },
  repository: { type: String, required: true },
  service: String,
  issueUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("IncidentIssueLink", incidentIssueLinkSchema);
