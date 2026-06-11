import { t } from "elysia";

export namespace PaymentModel {
  export const checkoutResponseSchema = t.Object({
    url: t.String(),
  });
  export type checkoutResponseSchema = typeof checkoutResponseSchema.static;

  export const balanceResponseSchema = t.Object({
    credits: t.Number(),
  });
  export type balanceResponseSchema = typeof balanceResponseSchema.static;

  export const unauthorizedResponseSchema = t.Object({
    message: t.Literal("Unauthorized"),
  });
  export type unauthorizedResponseSchema =
    typeof unauthorizedResponseSchema.static;

  export const webhookResponseSchema = t.Object({
    received: t.Boolean(),
  });
  export type webhookResponseSchema = typeof webhookResponseSchema.static;
}
