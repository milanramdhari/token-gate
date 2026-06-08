import { t } from "elysia";

export namespace PaymentModel {
  export const onrampResponseSchema = t.Object({
    message: t.Literal("Credits added successfully"),
    credits: t.Number(),
  });

  export type onrampResponseSchema = typeof onrampResponseSchema.static;

  export const balanceResponseSchema = t.Object({
    credits: t.Number(),
  });
  export type balanceResponseSchema = typeof balanceResponseSchema.static;

  export const unauthorizedResponseSchema = t.Object({
    message: t.Literal("Unauthorized"),
  });

  export type unauthorizedResponseSchema =
    typeof unauthorizedResponseSchema.static;
}
