import Elysia from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";

export const auth = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({ body, status }) => {
      try {
        const id = await AuthService.signUp(body.email, body.password);
        return { id };
      } catch (error) {
        console.log(error);
        return status(400, { message: "Invalid email or password" });
      }
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
    "/signin",
    async ({ body, status, cookie: { auth } }) => {
      const result = await AuthService.signIn(body.email, body.password);
      if (!result.correctCredentials) {
        return status(400, { message: "Invalid email or password" });
      }
      auth.set({
        value: result.userId,
        httpOnly: true,
        secure: true,
        maxAge: 86400,
        sameSite: "strict",
      });
      return status(200, { token: result.userId });
    },
    {
      body: AuthModel.signInSchema,
      response: {
        200: AuthModel.signinResponseSchema,
        400: AuthModel.errorResponseSchema,
      },
    },
  );
