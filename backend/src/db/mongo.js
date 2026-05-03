const mongoose = require("mongoose");

async function connectMongo() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/ims";
  await mongoose.connect(mongoUrl);
  console.log("Mongo connected");
}

module.exports = { connectMongo };