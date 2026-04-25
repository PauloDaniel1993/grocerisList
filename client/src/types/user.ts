export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type AuthStatus = "loading" | "ready";
