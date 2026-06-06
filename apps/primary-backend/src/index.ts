import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { app as apiKeys } from "./modules/apiKeys";

const app = new Elysia().use(auth).use(apiKeys).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
