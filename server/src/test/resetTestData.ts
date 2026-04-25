import bcrypt from "bcrypt";
import { prisma } from "../db.js";

const password = "password123!";

export async function resetAndSeedUsers() {
  await prisma.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@example.com",
      passwordHash,
      role: "user",
    },
  });
  await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
    },
  });
}

export const testPassword = password;
