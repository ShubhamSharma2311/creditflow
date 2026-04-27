import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./db";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,    
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

async function StartServer(){
 try{
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
 }
 catch(error){
    console.error("Server failed to start:", error);
    return
 }
}

StartServer();






