async function main() {
  const r = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "password123!" }),
  });
  const t = await r.text();
  console.log("status:", r.status);
  console.log("body:", t);
}
main();
