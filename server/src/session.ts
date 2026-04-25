import session from "express-session";

export const sessionMiddleware = session({
  store: new session.MemoryStore(),
  name: "prices.sid",
  secret: process.env.SESSION_SECRET ?? "dev-only-change-in-production-min-32",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.SESSION_INSECURE_COOKIES === "1"
        ? false
        : process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
