import axios from "@/lib/axios";
import { RegisterData, LoginData } from "./types";

export const registerUser = (data: RegisterData) => {
  return axios.post("/auth/register", data);
};

export const loginUser = (data: LoginData) => {
  return axios.post("/auth/login", data);
};