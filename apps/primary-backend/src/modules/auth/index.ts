import Elysia from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";

export const auth = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({ body }) => {
      const id = await AuthService.signUp(body.email, body.password);
      return { id: id };
    },
    {
      body: AuthModel.signUpSchema,
      response: {
        200: AuthModel.signUpResponseSchema,
        400: AuthModel.errorResponseSchema,
      },
    },
  )
  .post(
    "/signin", async ({ body }) => {
        const token = await AuthService.signIn(body.email, body.password);
        return { token };
    },
    {
      body: AuthModel.signInSchema,
      response: {
        200: AuthModel.signinResponseSchema,
        400: AuthModel.errorResponseSchema,
      },
    },
  );