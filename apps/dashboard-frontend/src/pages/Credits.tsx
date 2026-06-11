import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
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

export function Credits(): React.JSX.Element {
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const purchaseSuccess = searchParams.get("success") === "true";

  async function fetchBalance() {
    try {
      const { data } = await client.payments.balance.get();
      if (data) {
        setBalance(data.credits);
        setBalanceError(false);
      } else {
        setBalanceError(true);
      }
    } catch {
      setBalanceError(true);
    }
  }

  useEffect(() => {
    void fetchBalance();

    if (purchaseSuccess) {
      // Clear the query param without adding to history
      setSearchParams({}, { replace: true });
    }
  }, []);

  async function onramp() {
    setLoading(true);
    setPurchaseError(null);
    try {
      const { data } = await client.payments.onramp.post({});
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      console.error("[onramp]", err);
      setPurchaseError(message);
      setLoading(false);
    }
    // Don't reset loading on success — page is navigating away
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Credits</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        {purchaseSuccess && (
          <div className="rounded-lg border border-green-500/40 bg-green-50 dark:bg-green-950/20 px-4 py-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Payment successful — your credits have been added.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceError ? (
              <p className="text-sm text-destructive">Could not load balance</p>
            ) : (
              <p className="text-3xl font-bold">{balance ?? "—"}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Credits</CardTitle>
            <CardDescription>
              500 credits for $5.00. Processed securely by Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {purchaseError && (
              <p className="text-sm text-destructive">{purchaseError}</p>
            )}
            <Button
              onClick={() => void onramp()}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Redirecting to Stripe..." : "Buy Credits"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
