const mongoose = require("mongoose");

const githubInstallationSchema = new mongoose.Schema({
  installationId: { type: Number, required: true, unique: true },
  accountLogin: String,
  accountType: String,
  organization: String,
  repositorySelection: String,
  repositories: [String],
  permissions: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

githubInstallationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GithubInstallation", githubInstallationSchema);
