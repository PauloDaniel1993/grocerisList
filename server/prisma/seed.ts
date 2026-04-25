import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const defaultPassword =
  process.env.SEED_USER_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "password123!";

async function main() {
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  await prisma.user.upsert({
    where: { email: "user@example.com" },
    create: {
      name: "Demo User",
      email: "user@example.com",
      passwordHash,
      role: "user",
    },
    update: {
      passwordHash,
      name: "Demo User",
      role: "user",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      name: "Demo Admin",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
    },
    update: {
      passwordHash,
      name: "Demo Admin",
      role: "admin",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
