import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Layout } from "@/components/Layout";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Public page component for the authenticated user's profile.
 *
 * Displays the user's email address and usage summary (API key count and
 * total credits consumed). Also provides a sign-out action that clears the
 * session cookie and redirects to the sign-in page.
 *
 * @returns The rendered Profile page.
 */
export function Profile(): React.JSX.Element {
  const [email, setEmail] = useState<string | null>(null);
  const [keyCount, setKeyCount] = useState<number | null>(null);
  const [creditsConsumed, setCreditsConsumed] = useState<number | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    client.auth.me
      .get()
      .then(({ data }) => {
        if (data) setEmail(data.email);
      })
      .catch((err: unknown) => {
        console.error("Failed to load profile email", err);
        setEmail(null);
      });

    client["api-keys"]
      .get()
      .then(({ data }) => {
        if (data) {
          setKeyCount(data.apiKeys.length);
          setCreditsConsumed(
            data.apiKeys.reduce((sum, k) => sum + k.creditsConsumed, 0),
          );
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load API key stats", err);
        setKeyCount(0);
        setCreditsConsumed(0);
      });
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await client.auth.signout.post({});
      void navigate("/");
    } catch (err: unknown) {
      console.error("Sign-out failed", err);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-lg flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{email ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Aggregated stats across all API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">API Keys</span>
              <span className="font-medium">{keyCount ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credits Consumed</span>
              <span className="font-medium">{creditsConsumed ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="w-fit"
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </Layout>
  );
}
