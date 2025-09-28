import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered or token malfunctioned." });
    }

    // Convert stored chats into Gemini history format
    const history = user.chats.map(({ role, content }: { role: string; content: string }) => ({
      role: role === "assistant" ? "model" : role, // Gemini uses "user" and "model"
      parts: [{ text: content }],
    }));

    // Add latest user message
    history.push({ role: "user", parts: [{ text: message }] });
    user.chats.push({ role: "user", content: message });

    // Start chat session with history
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);

    const reply = result.response.text();
    if (!reply) {
      return res.status(500).json({ message: "No response from model" });
    }

    user.chats.push({ role: "assistant", content: reply });
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", cause: error.message });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered or token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered or token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Clear all chats
    // @ts-ignore
    user.chats = [];
    await user.save();

    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};
