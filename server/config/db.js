
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // MongoDB connection string
    // Railway uses MONGO_URL
    // Local environment can use MONGO_URI or MONGODB_URI
    const mongoURI =
      process.env.MONGO_URL ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URI;

    // Check if MongoDB URI exists
    if (!mongoURI) {
      throw new Error(
        "MONGO_URL, MONGO_URI or MONGODB_URI is missing from the environment variables."
      );
    }

    // Connect to MongoDB
    const connection = await mongoose.connect(mongoURI);

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`
    );

  } catch (error) {
    console.error(
      `MongoDB connection failed: ${error.message}`
    );

    process.exit(1);
  }
};

module.exports = connectDB;
