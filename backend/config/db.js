 const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined. Please set it in your .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);


    console.log(" Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;
