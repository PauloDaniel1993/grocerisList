import { prisma } from "./src/db.js";
import bcrypt from "bcrypt";

async function main() {
  const u = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });
  console.log("user exists:", !!u);
  console.log("email:", u?.email);
  console.log("role:", u?.role);
  console.log("hash starts with:", u?.passwordHash?.substring(0, 10));
  const ok = await bcrypt.compare("password123!", u!.passwordHash);
  console.log("password match:", ok);

  const allUsers = await prisma.user.findMany();
  console.log("total users:", allUsers.length);
  for (const user of allUsers) {
    console.log(`  ${user.email} (${user.role})`);
  }

  await prisma.$disconnect();
}
main();
