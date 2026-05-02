const mongoose = require("mongoose");

async function connectMongo() {
  await mongoose.connect("mongodb://localhost:27017/ims");
  console.log("Mongo connected");
}

module.exports = { connectMongo };