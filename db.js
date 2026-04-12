import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

export const connectDB=async()=>{
    if (!process.env.mongoUrl) {
        throw new Error("Missing `mongoUrl` in .env")
    }
    await mongoose.connect(process.env.mongoUrl)
    console.log("mongo DB Connected")
}
