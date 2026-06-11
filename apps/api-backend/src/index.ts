import bearer from "@elysiajs/bearer";
import { prisma } from "db";
import { Elysia } from "elysia";
import { Conversation } from "./types";
import { Gemini } from "./llms/GoogleAI";
import { OpenAi } from "./llms/OpenAI";
import { Claude } from "./llms/Claude";
import { LlmResponse } from "./llms/Base";
import { checkRateLimit } from "./rateLimit";

const app = new Elysia()
  .use(bearer())
  .post(
    "/api/v1/chat/completions",
    async ({ status, bearer: apiKey, body }) => {
      if (!apiKey) {
        return status(401, { message: "Missing API key" });
      }

      const rateLimit = checkRateLimit(apiKey);
      if (rateLimit) {
        return status(429, {
          message: `Rate limit exceeded. Retry after ${rateLimit.retryAfter}s`,
        });
      }

      try {
        const model = body.model;
        const [_companyName, providerModelName] = model.split("/");

        const apiKeyDb = await prisma.apiKey.findFirst({
          where: {
            apiKey,
            disabled: false,
            deleted: false,
          },
          select: {
            id: true,
            user: true,
          },
        });

        if (!apiKeyDb) {
          return status(403, { message: "Invalid API key" });
        }

        if (apiKeyDb.user.credits <= 0) {
          return status(402, { message: "Insufficient credits" });
        }

        const modelDb = await prisma.model.findFirst({
          where: { slug: model },
        });

        if (!modelDb) {
          return status(400, { message: "Unsupported model" });
        }

        const providers = await prisma.modelProviderMapping.findMany({
          where: { modelId: modelDb.id },
          include: { provider: true },
        });

        if (providers.length === 0) {
          return status(400, { message: "No providers available for this model" });
        }

        const providerMapping =
          providers[Math.floor(Math.random() * providers.length)];

        let response: LlmResponse | null = null;

        if (
          providerMapping.provider.name === "Google API" ||
          providerMapping.provider.name === "Google Vertex" ||
          providerMapping.provider.name === "GoogleAI"
        ) {
          response = await Gemini.chat(providerModelName, body.messages);
        } else if (providerMapping.provider.name === "OpenAI") {
          response = await OpenAi.chat(providerModelName, body.messages);
        } else if (
          providerMapping.provider.name === "Claude API" ||
          providerMapping.provider.name === "AnthropicAI"
        ) {
          response = await Claude.chat(providerModelName, body.messages);
        }

        if (!response) {
          return status(400, { message: "No provider handler for this model" });
        }

        const creditsUsed = Math.ceil(
          (response.inputTokensConsumed * providerMapping.inputTokenCost +
            response.outputTokensConsumed * providerMapping.outputTokenCost) /
            10,
        );

        const outputText =
          response.completions.choices[0]?.message.content ?? "";

        await prisma.$transaction([
          prisma.user.update({
            where: { id: apiKeyDb.user.id },
            data: { credits: { decrement: creditsUsed } },
          }),
          prisma.apiKey.update({
            where: { apiKey },
            data: {
              creditsConsumed: { increment: creditsUsed },
              lastUsed: new Date(),
            },
          }),
          prisma.conversation.create({
            data: {
              userId: apiKeyDb.user.id,
              apiKeyId: apiKeyDb.id,
              modelProviderMappingId: providerMapping.id,
              input: JSON.stringify(body.messages),
              output: outputText,
              inputTokenCount: response.inputTokensConsumed,
              outputTokenCount: response.outputTokensConsumed,
            },
          }),
        ]);

        return response;
      } catch (err) {
        console.error("[chat/completions]", err);
        return status(500, { message: "Internal server error" });
      }
    },
    {
      body: Conversation,
    },
  )
  .listen(3002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
