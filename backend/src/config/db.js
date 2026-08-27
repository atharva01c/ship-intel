const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    cachedConnection = connection;

    console.log(`MongoDB connected: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;