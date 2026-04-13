import express from "express";
import dotenv from "dotenv";
import authRouter from "./Routes/auth.router.js"
import userRouter from "./Routes/user.router.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(authRouter)
app.use(userRouter)

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`server is running on the port ${process.env.PORT}`);
});
