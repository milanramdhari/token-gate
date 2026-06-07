import Elysia from "elysia";
import { ModelModel } from "./model";
import { ModelService } from "./service";

export const app = new Elysia({ prefix: "models" })
  .get(
    "/",
    async () => {
      const models = await ModelService.getModels();
      return { models };
    },
    {
      response: {
        200: ModelModel.getModelsResponseSchema,
      },
    },
  )
  .get(
    "/:id/providers",
    async ({ params: { id }, status }) => {
      const modelId = parseInt(id, 10);
      if (!Number.isFinite(modelId)) {
        return status(400, { message: "Invalid model id" as const });
      }
      const providers = await ModelService.getModelProviders(modelId);
      if (!providers) {
        return status(404, { message: "Model not found" as const });
      }
      return { providers };
    },
    {
      response: {
        200: ModelModel.getModelProvidersResponseSchema,
        400: ModelModel.badRequestResponseSchema,
        404: ModelModel.notFoundResponseSchema,
      },
    },
  )
  .get(
    "/providers",
    async () => {
      const providers = await ModelService.getProviders();
      return { providers };
    },
    {
      response: {
        200: ModelModel.getProvidersResponseSchema,
      },
    },
  );
