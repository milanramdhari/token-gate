import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { app as apiKeys } from "./modules/apiKeys";
import { app as models } from "./modules/models";
import { app as payments } from "./modules/payments";

const app = new Elysia().use(auth).use(apiKeys).use(models).use(payments).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
