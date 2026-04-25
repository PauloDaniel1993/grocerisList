import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const baseUser = {
  id: "u1",
  name: "Demo User",
  email: "user@example.com",
  role: "user" as const,
  createdAt: "2020-01-01T00:00:00.000Z",
  updatedAt: "2020-01-01T00:00:00.000Z",
};

const baseAdmin = {
  id: "a1",
  name: "Demo Admin",
  email: "admin@example.com",
  role: "admin" as const,
  createdAt: "2020-01-01T00:00:00.000Z",
  updatedAt: "2020-01-01T00:00:00.000Z",
};

export { baseUser, baseAdmin };

export const server = setupServer(
  http.get("/api/users/me", () => {
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body?.email && body?.password) {
      if (body.email === "user@auth401.com") {
        return HttpResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      return HttpResponse.json({ user: { ...baseUser, email: body.email } });
    }
    return HttpResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  })
);

export function setSessionToUser() {
  server.use(
    http.get("/api/users/me", () => {
      return HttpResponse.json({ user: baseUser });
    })
  );
}

export function setSessionToAdmin() {
  server.use(
    http.get("/api/users/me", () => {
      return HttpResponse.json({ user: baseAdmin });
    })
  );
}

export function setAdminListHandlers() {
  const users = [baseUser, baseAdmin];
  server.use(
    http.get("/api/admin/users", () => {
      return HttpResponse.json({ users });
    })
  );
}

export function setProfileSaveHandler() {
  server.use(
    http.get("/api/users/me", () => {
      return HttpResponse.json({ user: baseUser });
    }),
    http.patch("/api/users/me", async ({ request }) => {
      const body = (await request.json()) as { name?: string };
      return HttpResponse.json({
        user: { ...baseUser, name: body.name ?? baseUser.name },
      });
    })
  );
}
