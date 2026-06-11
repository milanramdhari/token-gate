import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import { AnalyticsModel } from "./model";
import { AnalyticsService } from "./service";

export const app = new Elysia({ prefix: "analytics" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .resolve(async ({ cookie: { auth }, status, jwt }) => {
    if (!auth?.value) {
      return status(401, { message: "Unauthorized" as const });
    }

    const decoded = await jwt.verify(auth.value as string);

    if (!decoded || !decoded.userId) {
      return status(401, { message: "Unauthorized" as const });
    }

    return { userId: decoded.userId };
  })
  .get(
    "/",
    async ({ userId }) => {
      return AnalyticsService.getAnalytics(Number(userId));
    },
    {
      response: {
        200: AnalyticsModel.analyticsResponseSchema,
        401: AnalyticsModel.unauthorizedResponseSchema,
      },
    },
  );
