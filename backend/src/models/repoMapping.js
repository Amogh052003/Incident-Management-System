const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
  owner: String,
  name: String,
  fullName: String,
});

const repoMappingSchema = new mongoose.Schema({
  service: { type: String, required: true, unique: true },
  repo: repoSchema,
  mappingSource: { type: String, enum: ["annotation", "manual"], required: true },
  namespace: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

repoMappingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("RepoMapping", repoMappingSchema);
