const mongoose = require("mongoose");

const signalSchema = new mongoose.Schema({
  component_id: String,
  message: String,
  severity: String,
  work_item_id: Number,
  timestamp: Date,
});

signalSchema.index({ message: "text" });

const Signal = mongoose.model("Signal", signalSchema);

module.exports = Signal;