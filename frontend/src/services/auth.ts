import axios from "@/lib/axios";

// Owner
export const ownerRegister = (data: any) => {
  return axios.post("/auth/register", data);
};

export const ownerLogin = (data: any) => {
  return axios.post("/auth/login", data);
};

// Customer
export const customerRegister = (data: any) => {
  return axios.post("/customer/register", data);
};

export const customerLogin = (data: any) => {
  return axios.post("/customer/login", data);
};

export const superAdminLogin = (data: any) => {
  return axios.post("/auth/superadmin/login", data);
};
export const staffLogin = (data: any) => {
  return axios.post("/auth/staff/login", data);
};