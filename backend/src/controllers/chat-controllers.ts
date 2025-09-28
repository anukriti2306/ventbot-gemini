import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

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

    // Map chats to Groq-compatible type
    const formattedChats = user.chats.map(({ role, content }) => ({
      role: role as "user" | "assistant" | "system",
      content,
    }));

    // Add the latest user message
    formattedChats.push({ role: "user", content: message });
    user.chats.push({ role: "user", content: message });

    // Create chat completion
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: formattedChats,
    });

    const reply = chatResponse.choices[0]?.message;
    if (!reply) {
      return res.status(500).json({ message: "No response from model" });
    }

    user.chats.push({ role: reply.role, content: reply.content || "" });
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", cause: error.message });
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
