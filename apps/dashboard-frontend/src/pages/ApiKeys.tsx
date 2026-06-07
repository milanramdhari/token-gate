import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ApiKey {
  id: string;
  apiKey: string;
  name: string;
  creditsConsumed: number;
  lastUsed: Date | null;
  disabled: boolean;
}

/**
 * Public page component for managing API keys.
 *
 * Displays all API keys for the authenticated user and allows creating,
 * enabling/disabling, and deleting them. Newly created key values are shown
 * once immediately after creation and not retrievable again.
 *
 * @returns The rendered API Keys management page.
 */
export function ApiKeys(): React.JSX.Element {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<{ id: string; apiKey: string } | null>(
    null,
  );

  async function fetchKeys() {
    const { data } = await client["api-keys"].get();
    if (data) setApiKeys(data.apiKeys);
  }

  useEffect(() => {
    void fetchKeys();
  }, []);

  async function createKey() {
    if (!newName.trim()) return;
    setCreating(true);
    const { data } = await client["api-keys"].post({ name: newName });
    setCreating(false);
    if (data) {
      setNewKey(data);
      setNewName("");
      setShowCreate(false);
      await fetchKeys();
    }
  }

  async function toggleDisabled(id: string, disabled: boolean) {
    await client["api-keys"].put({ id, disabled });
    await fetchKeys();
  }

  async function deleteKey(id: string) {
    await client["api-keys"]({ id }).delete();
    await fetchKeys();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <Button onClick={() => setShowCreate(true)} disabled={showCreate}>
          New Key
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardContent className="pt-6 flex gap-3 items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <Label>Key Name</Label>
              <Input
                placeholder="e.g. Production"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void createKey()}
                autoFocus
              />
            </div>
            <Button onClick={() => void createKey()} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {newKey && (
        <Card className="mb-6 border-green-500/40 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">
              New key created — copy it now, it won&apos;t be shown again.
            </p>
            <code className="text-sm break-all font-mono bg-muted px-2 py-1 rounded block">
              {newKey.apiKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setNewKey(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {apiKeys.length === 0 && (
          <p className="text-sm text-muted-foreground">No API keys yet.</p>
        )}
        {apiKeys.map((key) => (
          <Card key={key.id} className={key.disabled ? "opacity-60" : ""}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {key.apiKey.slice(0, 8)}...{key.apiKey.slice(-4)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {key.creditsConsumed} credits consumed
                  {key.lastUsed
                    ? ` · Last used ${new Date(key.lastUsed).toLocaleDateString()}`
                    : " · Never used"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void toggleDisabled(key.id, !key.disabled)}
                >
                  {key.disabled ? "Enable" : "Disable"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void deleteKey(key.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
