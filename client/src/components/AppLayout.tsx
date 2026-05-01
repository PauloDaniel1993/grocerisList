import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  ThemeToggleInline,
  ThemeToggleMenuItem,
} from "@/components/ThemeToggle";

type NavItem = { to: string; label: string; end?: boolean };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navItems: NavItem[] = [
    { to: "/grocery-lists", label: "My lists", end: true },
    { to: "/account/profile", label: "Profile", end: true },
  ];
  if (user.role === "admin") {
    navItems.push({ to: "/admin/users", label: "Users" });
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      isActive
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground",
    );

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex h-11 items-center rounded-md px-3 text-base font-medium transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      isActive
        ? "bg-accent text-accent-foreground"
        : "text-foreground",
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <NavLink
            to="/grocery-lists"
            className="rounded-sm text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Groceries
          </NavLink>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={desktopLinkClass}
              >
                {item.label}
              </NavLink>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-11 w-11 rounded-full"
                  aria-label="Open user menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-xs text-muted-foreground">
                    Signed in as
                  </span>
                  <span className="block truncate font-medium">{user.name}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/account/profile")}>
                  <UserIcon />
                  <span>Profile</span>
                </DropdownMenuItem>
                {user.role === "admin" ? (
                  <DropdownMenuItem onSelect={() => navigate("/admin/users")}>
                    <ShieldCheck />
                    <span>Users</span>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <ThemeToggleMenuItem />
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleLogout()}>
                  <LogOut />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0">
              <SheetTitle className="sr-only">Main menu</SheetTitle>
              <div className="flex items-center gap-3 border-b px-4 py-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Signed in as
                  </div>
                  <div className="truncate text-sm font-medium">
                    {user.name}
                  </div>
                </div>
              </div>
              <nav
                aria-label="Main"
                className="flex flex-1 flex-col gap-1 px-3 py-4"
              >
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={mobileLinkClass}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <Separator />
              <div className="px-3 py-4">
                <ThemeToggleInline />
              </div>
              <Separator />
              <div className="px-3 py-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setMobileOpen(false);
                    void handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
