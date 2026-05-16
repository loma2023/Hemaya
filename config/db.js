const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {

  if (isConnected) {
    return;
  }

  try {

    const db = await mongoose.connect(process.env.MONGOOSE_URL);

    isConnected = db.connections[0].readyState;

    console.log("MongoDB Connected");

  } catch (err) {

    console.log(err);

  }

};

module.exports = connectDB;