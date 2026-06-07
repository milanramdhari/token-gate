import React, { useEffect, useState } from "react";
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
 * Public page component for managing credits.
 *
 * Shows the current credit balance and allows the authenticated user to
 * purchase more credits via the onramp endpoint.
 *
 * @returns The rendered Credits page.
 */
export function Credits(): React.JSX.Element {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.payments.balance.get().then(({ data }) => {
      if (data) setBalance(data.credits);
    });
  }, []);

  async function onramp() {
    setLoading(true);
    const { data } = await client.payments.onramp.post({});
    setLoading(false);
    if (data) setBalance(data.credits);
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Credits</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {balance ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Credits</CardTitle>
            <CardDescription>
              Purchase credits to use with your API keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => void onramp()}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Processing..." : "Buy Credits"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
