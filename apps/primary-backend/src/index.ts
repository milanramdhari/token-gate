import { app } from "../app";

const port = Number(process.env.PORT) || 3001;

app.listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
