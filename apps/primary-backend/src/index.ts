import { Elysia } from "elysia";
import { auth } from "./modules/auth";

const app = new Elysia().use(auth).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);