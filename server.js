import express from "express";
import dotenv from "dotenv";
import authRouter from "./Routes/auth.router.js";
import userRouter from "./Routes/user.router.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NODE JS PROJECT BACKEND API",
      version: "1.0.0",
      description: "API documentation for the  Node js backend",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
        },
      },
    },
  },
  apis: ["./Routes/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRouter);
app.use(userRouter);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`server is running on the port ${process.env.PORT}`);
});
