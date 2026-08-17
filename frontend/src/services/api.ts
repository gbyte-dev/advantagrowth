import axios from "@/lib/axios";

export const ownerRegister = (data: any) => {
  return axios.post("/auth/register", data);
};

export const ownerLogin = (data: any) => {
  return axios.post("/auth/login", data);
};