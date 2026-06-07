import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { PaymentModel } from "./model";
import { PaymentService } from "./service";

export const app = new Elysia({ prefix: "payments" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .resolve(async ({ cookie: { auth }, status, jwt }) => {
    if (!auth) {
      return status(401, { message: "Unauthorized" as const });
    }

    const decoded = await jwt.verify(auth.value as string);

    if (!decoded || !decoded.userId) {
      return status(401, { message: "Unauthorized" as const });
    }

    return {
      userId: decoded.userId,
    };
  })
  .post(
    "/onramp",
    async ({ userId }) => {
      const { credits } = await PaymentService.onramp(Number(userId));
      return {
        message: "Credits added successfully" as const,
        credits,
      };
    },
    {
      response: {
        200: PaymentModel.onrampResponseSchema,
        401: PaymentModel.unauthorizedResponseSchema,
      },
    },
  );
