import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Dashboard() {
  const [keyCount, setKeyCount] = useState<number | null>(null);
  const [creditsConsumed, setCreditsConsumed] = useState<number | null>(null);

  useEffect(() => {
    client["api-keys"].get().then(({ data }) => {
      if (data) {
        setKeyCount(data.apiKeys.length);
        setCreditsConsumed(
          data.apiKeys.reduce((sum, k) => sum + k.creditsConsumed, 0),
        );
      }
    });
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {keyCount ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credits Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {creditsConsumed ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/apikeys">Manage API Keys</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/credits">Add Credits</Link>
        </Button>
      </div>
    </Layout>
  );
}
