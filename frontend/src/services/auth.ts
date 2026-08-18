import axios from "@/lib/axios";

// Owner Registration
export const ownerRegister = (data: any) => {
  return axios.post("/auth/register", data);
};

// Unified Owner + Staff Login
export const login = (data: {
  login: string;
  password: string;
}) => {
  return axios.post("/auth/login", data);
};

// Super Admin Login
export const superAdminLogin = (data: any) => {
  return axios.post("/auth/superadmin/login", data);
};
