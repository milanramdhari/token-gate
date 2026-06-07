import { useState } from "react";
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

export function Credits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function onramp() {
    setLoading(true);
    const { data } = await client.payments.onramp.post({});
    setLoading(false);
    if (data) setCredits(data.credits);
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Credits</h1>
      <div className="max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Add Credits</CardTitle>
            <CardDescription>
              Purchase credits to use with your API keys.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {credits !== null && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Credits added! New balance:{" "}
                <strong>{credits}</strong>
              </p>
            )}
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
