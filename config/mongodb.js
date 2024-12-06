import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Event Listeners: when connected
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB 🚀");
    });

    // Event Listeners: when error occuring on connection
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    // Event Listeners: when disconnected
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/backendtest`);

    console.log("Database connection successful 🌟");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
