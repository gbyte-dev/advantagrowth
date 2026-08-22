import api from "@/lib/axios";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  },
});

export const getStaff = () => {
  return api.get("/auth/staff", authHeader());
};

export const createStaff = (data: FormData) => {
  return api.post("/auth/staff", data, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateStaff = (id: number, data: FormData) => {
  return api.post(`/auth/staff/${id}`, data, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
    params: {
      _method: "PUT",
    },
  });
};

export const deleteStaff = (id: number) => {
  return api.delete(`/auth/staff/${id}`, authHeader());
};