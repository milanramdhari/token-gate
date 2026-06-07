import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/apikeys", label: "API Keys" },
  { path: "/models", label: "Models" },
  { path: "/credits", label: "Credits" },
  { path: "/profile", label: "Profile" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-semibold tracking-tight">token-gate</span>
          <nav className="flex gap-1">
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
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
