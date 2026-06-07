import { t } from "elysia";

export namespace ModelModel {
  export const providerInModelSchema = t.Object({
    id: t.String(),
    name: t.String(),
    website: t.String(),
    inputTokenCost: t.Number(),
    outputTokenCost: t.Number(),
  });

  export const modelSchema = t.Object({
    id: t.String(),
    name: t.String(),
    slug: t.String(),
    providers: t.Array(providerInModelSchema),
  });

  export const getModelsResponseSchema = t.Object({
    models: t.Array(modelSchema),
  });

  export type getModelsResponseSchema = typeof getModelsResponseSchema.static;

  export const modelInProviderSchema = t.Object({
    id: t.String(),
    name: t.String(),
    slug: t.String(),
  });

  export const providerSchema = t.Object({
    id: t.String(),
    name: t.String(),
    website: t.String(),
    models: t.Array(modelInProviderSchema),
  });

  export const getProvidersResponseSchema = t.Object({
    providers: t.Array(providerSchema),
  });

  export type getProvidersResponseSchema =
    typeof getProvidersResponseSchema.static;

  export const getModelProvidersResponseSchema = t.Object({
    providers: t.Array(providerInModelSchema),
  });

  export type getModelProvidersResponseSchema =
    typeof getModelProvidersResponseSchema.static;

  export const notFoundResponseSchema = t.Object({
    message: t.Literal("Model not found"),
  });

  export type notFoundResponseSchema = typeof notFoundResponseSchema.static;
}
