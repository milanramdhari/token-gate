import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "API Key Management",
    description:
      "Create and manage multiple API keys with per-key usage tracking, enable/disable controls, and instant deletion.",
  },
  {
    title: "Credit System",
    description:
      "Pre-purchase credits and consume them across requests. Monitor spend per key so you always know where your budget goes.",
  },
  {
    title: "Multi-provider Routing",
    description:
      "Route requests to the best available provider for each model — OpenAI, Anthropic, and more — with a single unified key.",
  },
];

/**
 * Public landing page for token-gate.
 *
 * Marketing page shown to unauthenticated visitors with a hero section,
 * feature highlights, and calls to action for sign-up and sign-in.
 *
 * @returns The rendered Landing page.
 */
export function Landing(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">token-gate</span>
          {/* <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div> */}
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl">
          Secure API access for AI models
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          One gateway for every AI provider. Issue scoped API keys, track credit
          consumption per key, and switch providers without changing your
          integration.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} token-gate
          </p>
        </div>
      </footer>
    </div>
  );
}
