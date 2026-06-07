import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./src/modules/auth";
import { app as apiKeys } from "./src/modules/apiKeys";
import { app as models } from "./src/modules/models";
import { app as payments } from "./src/modules/payments";

export const app = new Elysia()
  .use(cors({ origin: "http://localhost:3000", credentials: true }))
  .use(auth)
  .use(apiKeys)
  .use(models)
  .use(payments);

export type App = typeof app;
