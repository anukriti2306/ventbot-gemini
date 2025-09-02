import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

const app = express();

// ----------- CORS Configuration -----------
const allowedOrigins = [
  process.env.FRONTEND_URL,        // e.g., https://your-app.vercel.app
  "http://localhost:5173"          // Dev Vite server
].filter(Boolean);                 // Filter out any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl/Postman (no origin header)
    if (!origin) return callback(null, true);

    const normalized = origin.toLowerCase().replace(/\/$/, "");
    const isAllowed = allowedOrigins.includes(normalized);

    console.log(`🔗 CORS request from: ${origin}`);
    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`❌ Blocked by CORS: ${origin}`);

    // Optional: silently reject in production, throw in dev
    if (process.env.NODE_ENV === "production") {
      return callback(null, false);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ----------- Middleware -----------
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev")); // Log requests in dev

// ----------- Routes -----------
app.use("/api/v1", appRouter);

export default app;
