import { client } from "@/lib/client";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Public page component for signing in to an existing account.
 *
 * Renders an email/password form. On success the user is redirected to
 * `/dashboard`; on failure an inline error message is shown.
 *
 * @returns The rendered Sign In page.
 */
export function SignIn(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function signIn() {
    setError("");
    setLoading(true);
    const { data, error: err } = await client.auth.signin.post({
      email,
      password,
    });
    setLoading(false);
    if (err || !data) {
      setError("Invalid email or password");
      return;
    }
    void navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void signIn()}
            />
          </div>
          <Button
            onClick={() => void signIn()}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
