import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
axios.defaults.withCredentials = true; // ✅ allow cookies for auth

// ------------------- AUTH -------------------

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post("/user/login", { email, password });
  return res.data;
};

export const signupUser = async (name: string, email: string, password: string) => {
  const res = await axios.post("/user/signup", { name, email, password });
  return res.data;
};

export const checkAuthStatus = async () => {
  try {
    const res = await axios.get("/user/auth-status");
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401) return null; // ✅ not logged in
    throw new Error(err.response?.data?.message || "Unable to authenticate.");
  }
};

export const logoutUser = async () => {
  const res = await axios.post("/user/logout"); // 🔄 use POST if supported
  return res.data;
};

// ------------------- CHATS -------------------

export const sendChatRequest = async (message: string) => {
  const res = await axios.post("/chat/new", { message });
  return res.data;
};

export const getUserChats = async () => {
  const res = await axios.get("/chat/all-chats");
  return res.data;
};

export const deleteUserChats = async () => {
  const res = await axios.delete("/chat/delete");
  return res.data;
};
