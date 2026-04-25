import type { User } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

function assertRole(r: string): r is "user" | "admin" {
  return r === "user" || r === "admin";
}

export function toPublicUser(user: User): PublicUser {
  if (!assertRole(user.role)) {
    throw new Error("Invalid user role in database");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
