import { create } from "zustand";
import * as api from "../api/client";
import type { AuthStatus } from "../types/user";
import type { User } from "../types/user";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  async bootstrap() {
    set({ status: "loading" });
    try {
      const user = await api.getSessionUser();
      set({ user, status: "ready" });
    } catch {
      set({ user: null, status: "ready" });
    }
  },
  async login(email, password) {
    const { user } = await api.login(email, password);
    set({ user, status: "ready" });
  },
  async logout() {
    await api.logout();
    set({ user: null, status: "ready" });
  },
  setUser(user) {
    set({ user });
  },
  async refreshUser() {
    const user = await api.getMe();
    set({ user, status: "ready" });
  },
}));
