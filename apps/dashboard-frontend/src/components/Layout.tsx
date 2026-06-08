import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { client } from "@/lib/client";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/apikeys", label: "API Keys" },
  { path: "/models", label: "Models" },
  { path: "/credits", label: "Credits" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    client.auth.me
      .get()
      .then(({ data }) => {
        if (data) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await client.auth.signout.post({});
      void navigate("/");
    } catch {
      // ignore
    } finally {
      setSigningOut(false);
    }
  }

  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-semibold tracking-tight">token-gate</span>
          <nav className="flex gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === item.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative group">
            <button className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center select-none cursor-pointer">
              {initial}
            </button>
            <div className="absolute right-0 top-10 z-50 hidden group-hover:flex flex-col min-w-max bg-popover border rounded-lg shadow-md p-3 gap-2">
              <p className="text-sm text-muted-foreground">{email ?? "—"}</p>
              <button
                onClick={() => void signOut()}
                disabled={signingOut}
                className="text-sm text-destructive hover:underline text-left disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
