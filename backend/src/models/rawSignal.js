const mongoose = require("mongoose");

const rawSignalSchema = new mongoose.Schema(
  {
    payload: {
      type: Object,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "raw_signals",
  }
);

const RawSignal = mongoose.model("RawSignal", rawSignalSchema);

module.exports = RawSignal;
