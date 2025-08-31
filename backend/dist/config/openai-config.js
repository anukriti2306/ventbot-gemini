// openai-config.ts (now using Gemini instead of Groq)
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
export const configureGemini = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
    }
    // Create Gemini client
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};
//# sourceMappingURL=openai-config.js.map