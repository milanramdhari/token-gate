import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { ApiKeyModel } from "./model";
import { ApiKeyService } from "./service";

export const app = new Elysia({ prefix: "api-keys" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .resolve(async ({ cookie: { auth }, status, jwt }) => {
    if (!auth) {
      return status(401);
    }

    const decoded = await jwt.verify(auth.value as string);

    if (!decoded) {
      return status(401);
    }

    return {
      userId: decoded.userId,
    };
  })
  .post(
    "/",
    async ({ userId, body }) => {
      const { apiKey, id } = await ApiKeyService.createApiKey(
        body.name,
        Number(userId),
      );
      return {
        id,
        apiKey,
      };
    },
    {
      body: ApiKeyModel.createApiKeySchema,
      response: {
        200: ApiKeyModel.createApiKeyReponse,
      },
    },
  )
  .get(
    "/",
    async ({ userId }) => {
      const apiKeys = await ApiKeyService.getApiKeys(Number(userId));
      return {
        apiKeys: apiKeys,
      };
    },
    {
      response: {
        200: ApiKeyModel.getApiKeysResponseSchema,
      },
    },
  )
  .put(
    "/",
    async ({ body, userId, status }) => {
      const updated = await ApiKeyService.updateApiKeyDisabled(
        Number(body.id),
        Number(userId),
        body.disabled,
      );

      if (!updated) {
        return status(401, { message: "Unauthorized" });
      }

      return {
        message: "Updated api key successfully",
      };
    },
    {
      body: ApiKeyModel.updateApiKeySchema,
      response: {
        200: ApiKeyModel.updateApiKeyResponseSchema,
        401: ApiKeyModel.unauthorizedResponseSchema,
        411: ApiKeyModel.disableApiKeyResponseFailedSchema,
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, userId, status }) => {
      const deleted = await ApiKeyService.delete(Number(id), Number(userId));

      if (!deleted) {
        return status(401, { message: "Unauthorized" });
      }

      return {
        message: "Api key deleted successfully",
      };
    },
    {
      response: {
        200: ApiKeyModel.deleteApiKeyResponseSchema,
        401: ApiKeyModel.unauthorizedResponseSchema,
        411: ApiKeyModel.deleteApiKeyResponseFailedSchema,
      },
    },
  );
