import type { App as PrimaryBackendApp } from "app";
import { treaty } from "@elysia/eden";

export const client = treaty<PrimaryBackendApp>("http://localhost:3001");
