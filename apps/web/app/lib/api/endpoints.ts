
import { api } from "./client";

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
};

export const usersApi = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },
};
