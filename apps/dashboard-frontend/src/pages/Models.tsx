import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { client } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Provider {
  id: string;
  name: string;
  website: string;
  inputTokenCost: number;
  outputTokenCost: number;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  providers: Provider[];
}

/**
 * Public page component listing all available AI models and their providers.
 *
 * Fetches models from the backend and renders them as a grid of cards.
 * Clicking a card expands a provider detail panel showing cost information.
 *
 * @returns The rendered Models page.
 */
export function Models(): React.JSX.Element {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    client.models.get().then(({ data }) => {
      if (data) setModels(data.models);
    });
  }, []);

  function toggleModel(id: string) {
    setSelectedModelId((prev) => (prev === id ? null : id));
  }

  const selectedModel = models.find((m) => m.id === selectedModelId) ?? null;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Models</h1>

      {models.length === 0 ? (
        <p className="text-sm text-muted-foreground">No models available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => {
            const isSelected = selectedModelId === model.id;
            return (
              <Card
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${isSelected ? "ring-2 ring-ring" : ""}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    {model.slug}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {model.providers.length}{" "}
                    {model.providers.length === 1 ? "provider" : "providers"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedModel && (
        <div className="mt-6 border rounded-xl p-6">
          <h3 className="font-semibold mb-4">
            Providers for {selectedModel.name}
          </h3>
          <div className="flex flex-col divide-y">
            {selectedModel.providers.map((provider) => (
              <div
                key={provider.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-sm hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {provider.name}
                </a>
                <div className="flex gap-4 text-xs text-muted-foreground shrink-0">
                  <span>
                    In: <strong>${provider.inputTokenCost}</strong>/token
                  </span>
                  <span>
                    Out: <strong>${provider.outputTokenCost}</strong>/token
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
