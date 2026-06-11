import { t } from "elysia";

export namespace AnalyticsModel {
  export const requestsPerDaySchema = t.Object({
    date: t.String(),
    count: t.Number(),
  });

  export const tokensPerDaySchema = t.Object({
    date: t.String(),
    input: t.Number(),
    output: t.Number(),
  });

  export const creditsByKeySchema = t.Object({
    name: t.String(),
    creditsConsumed: t.Number(),
  });

  export const analyticsResponseSchema = t.Object({
    requestsPerDay: t.Array(requestsPerDaySchema),
    tokensPerDay: t.Array(tokensPerDaySchema),
    creditsByKey: t.Array(creditsByKeySchema),
  });
  export type analyticsResponseSchema = typeof analyticsResponseSchema.static;

  export const unauthorizedResponseSchema = t.Object({
    message: t.Literal("Unauthorized"),
  });
  export type unauthorizedResponseSchema =
    typeof unauthorizedResponseSchema.static;
}
