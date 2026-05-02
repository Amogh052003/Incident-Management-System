const mongoose = require("mongoose");

const signalSchema = new mongoose.Schema({
  component_id: String,
  message: String,
  work_item_id: Number,
  timestamp: Date,
});

const Signal = mongoose.model("Signal", signalSchema);

module.exports = Signal;