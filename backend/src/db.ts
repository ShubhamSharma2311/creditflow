import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.DATABASE_URL;

    if (!mongoURI) {
      console.log("Please provide database URL");
      return;
    }

   const connectionInstance= await mongoose.connect(mongoURI);
    console.log("Database connected successfully", connectionInstance.connection.host);
  } catch (error) {
    console.error("Database connection failed:", error);
    return;
  }
};

export default connectDB;
