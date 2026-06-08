import Elysia from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";
import { jwt } from "@elysiajs/jwt";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  maxAge: 86400,
  sameSite: isProduction ? ("strict" as const) : ("lax" as const),
  secure: isProduction,
};

export const auth = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "JWTNamespace", secret: process.env.JWT_SECRET }))
  .post(
    "/signup",
    async ({ body, status, JWTNamespace, cookie: { auth } }) => {
      try {
        const result = await AuthService.signUp(body.email, body.password);
        if (!result.correctCredentials) {
          return status(400, { message: "Invalid email or password" });
        }
        const token = await JWTNamespace.sign({ userId: result.userId });
        auth.set({ value: token, ...cookieOptions });
        return status(200, { token });
      } catch (error) {
        console.log(error);
        return status(400, { message: "Invalid email or password" });
      }
    },
    {
      body: AuthModel.signUpSchema,
      response: {
        200: AuthModel.tokenResponseSchema,
        400: AuthModel.errorResponseSchema,
      },
    },
  )
  .post(
    "/signin",
    async ({ body, status, JWTNamespace, cookie: { auth } }) => {
      try {
        const result = await AuthService.signIn(body.email, body.password);
        if (!result.correctCredentials) {
          return status(400, { message: "Invalid email or password" });
        }
        const token = await JWTNamespace.sign({ userId: result.userId });
        auth.set({ value: token, ...cookieOptions });
        return status(200, { token });
      } catch (error) {
        console.log(error);
        return status(400, { message: "Invalid email or password" });
      }
    },
    {
      body: AuthModel.signInSchema,
      response: {
        200: AuthModel.tokenResponseSchema,
        400: AuthModel.errorResponseSchema,
      },
    },
  )
  .get(
    "/me",
    async ({ JWTNamespace, cookie: { auth }, status }) => {
      const decoded = await JWTNamespace.verify(auth.value as string);
      if (!decoded || !decoded.userId) {
        return status(401, { message: "Unauthorized" as const });
      }
      const email = await AuthService.getEmail(Number(decoded.userId));
      if (!email) {
        return status(401, { message: "Unauthorized" as const });
      }
      return { email };
    },
    {
      response: {
        200: AuthModel.meResponseSchema,
        401: AuthModel.unauthorizedResponseSchema,
      },
    },
  )
  .post(
    "/signout",
    ({ cookie: { auth } }) => {
      auth.remove();
      return { message: "Signed out" as const };
    },
    {
      response: {
        200: AuthModel.signOutResponseSchema,
      },
    },
  );
