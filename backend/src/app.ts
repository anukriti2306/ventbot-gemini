import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://ventbot-gemini.vercel.app
  "http://localhost:5173",  // add local dev if needed
].filter(Boolean); // remove undefined

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS request from:", origin);

      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin); // ✅ echo back the actual origin
      }

      console.warn("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true, // ✅ allows cookies, Authorization headers
  })
);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Dev logging
app.use(morgan("dev"));

app.use("/api/v1/", appRouter);

export default app;
