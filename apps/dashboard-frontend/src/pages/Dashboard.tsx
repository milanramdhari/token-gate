import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Coins, Layers, Plus, ArrowRight } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ApiKey {
  id: string;
  apiKey: string;
  name: string;
  creditsConsumed: number;
  disabled: boolean;
}

interface Analytics {
  requestsPerDay: { date: string; count: number }[];
  tokensPerDay: { date: string; input: number; output: number }[];
  creditsByKey: { name: string; creditsConsumed: number }[];
}

function formatDay(value: unknown): string {
  // Coerce to a string first: the value may arrive as a string, number, or Date
  // depending on serialization. Then parse just the YYYY-MM-DD portion.
  // Noon avoids any timezone-driven off-by-one on the weekday.
  const s = value instanceof Date ? value.toISOString() : String(value ?? "");
  const d = new Date(`${s.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date(s);
    return Number.isNaN(fallback.getTime())
      ? s
      : fallback.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function Dashboard(): React.JSX.Element {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [modelCount, setModelCount] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [keysRes, modelsRes, analyticsRes] = await Promise.all([
          client["api-keys"].get(),
          client.models.get(),
          client.analytics.get(),
        ]);
        if (keysRes.data) setApiKeys(keysRes.data.apiKeys);
        if (modelsRes.data) setModelCount(modelsRes.data.models.length);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("[Dashboard] failed to load data", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const activeKeys = apiKeys.filter((k) => !k.disabled).length;
  const totalCreditsUsed = apiKeys.reduce(
    (sum, k) => sum + k.creditsConsumed,
    0,
  );

  const requestsData = (analytics?.requestsPerDay ?? []).map((row) => ({
    day: formatDay(row.date),
    count: row.count,
  }));
  const tokensData = (analytics?.tokensPerDay ?? []).map((row) => ({
    day: formatDay(row.date),
    input: row.input,
    output: row.output,
  }));
  const creditsData = analytics?.creditsByKey ?? [];
  const hasChartData =
    requestsData.length > 0 ||
    tokensData.length > 0 ||
    creditsData.length > 0;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active API Keys
            </CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{isLoading ? "—" :activeKeys}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "" : `${apiKeys.length} total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credits Used
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? "—" :totalCreditsUsed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">across all keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Models
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? "—" :(modelCount ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              from all providers
            </p>
          </CardContent>
        </Card>
      </div>

      {!isLoading && hasChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Requests (last 7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={requestsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(120,120,120,0.1)" }}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar
                    dataKey="count"
                    name="Requests"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tokens (last 7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={tokensData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} width={48} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="input"
                    name="Input"
                    stackId="tokens"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="output"
                    name="Output"
                    stackId="tokens"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits by API key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={creditsData}
                  layout="vertical"
                  margin={{ left: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(120,120,120,0.1)" }}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar
                    dataKey="creditsConsumed"
                    name="Credits"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2 w-fit">
                <Plus className="h-5 w-5" />
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/apikeys">
                  Go <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div>
              <p className="font-semibold">Create API Key</p>
              <p className="text-sm text-muted-foreground">
                Generate a new key to start making requests.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2 w-fit">
                <Coins className="h-5 w-5" />
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/credits">
                  Go <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div>
              <p className="font-semibold">Add Credits</p>
              <p className="text-sm text-muted-foreground">
                Top up your balance to keep making requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Key
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Credits Used
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : apiKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No API keys yet.{" "}
                  <Link to="/apikeys" className="underline underline-offset-2">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{key.name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {key.apiKey.slice(0, 8)}...{key.apiKey.slice(-5)}
                  </td>
                  <td className="px-4 py-3">
                    {key.disabled ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                        Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {key.creditsConsumed}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
