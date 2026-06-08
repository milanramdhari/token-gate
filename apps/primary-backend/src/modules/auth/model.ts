import { t } from "elysia";

export namespace AuthModel {
  export const signInSchema = t.Object({
    email: t.String(),
    password: t.String(),
  });

  export type signInSchema = typeof signInSchema.static;

  export const tokenResponseSchema = t.Object({
    token: t.String(),
  });

  export type tokenResponseSchema = typeof tokenResponseSchema.static;

  export const signUpSchema = t.Object({
    email: t.String(),
    password: t.String(),
  });
  export type signUpSchema = typeof signUpSchema.static;

  export const errorResponseSchema = t.Object({
    message: t.Literal("Invalid email or password"),
  });
  export type errorResponseSchema = typeof errorResponseSchema.static;

  export const meResponseSchema = t.Object({
    email: t.String(),
  });
  export type meResponseSchema = typeof meResponseSchema.static;

  export const signOutResponseSchema = t.Object({
    message: t.Literal("Signed out"),
  });
  export type signOutResponseSchema = typeof signOutResponseSchema.static;

  export const unauthorizedResponseSchema = t.Object({
    message: t.Literal("Unauthorized"),
  });
  export type unauthorizedResponseSchema = typeof unauthorizedResponseSchema.static;
}
