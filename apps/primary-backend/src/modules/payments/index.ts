import Stripe from "stripe";
import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import { PaymentModel } from "./model";
import { PaymentService } from "./service";

// Webhook has no auth — Stripe calls it directly with no session cookie.
// It needs the raw request body to verify the Stripe signature.
const webhook = new Elysia().post(
  "/payments/webhook",
  async ({ body, headers, status }) => {
    const signature = headers["stripe-signature"];

    if (!signature) {
      return status(400, { message: "Missing Stripe signature" });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return status(500, { message: "Stripe webhook not configured" });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return status(500, { message: "Stripe not configured" });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-05-28.basil" });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body as string,
        signature,
        webhookSecret,
      );
    } catch {
      return status(400, { message: "Invalid webhook signature" });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await PaymentService.fulfillCheckout(session.id);
    }

    return { received: true };
  },
  {
    type: "text",
  },
);

// Authenticated routes
const authenticated = new Elysia({ prefix: "payments" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .resolve(async ({ cookie: { auth }, status, jwt }) => {
    if (!auth?.value) {
      return status(401, { message: "Unauthorized" as const });
    }

    const decoded = await jwt.verify(auth.value as string);

    if (!decoded || !decoded.userId) {
      return status(401, { message: "Unauthorized" as const });
    }

    return { userId: decoded.userId };
  })
  .get(
    "/balance",
    async ({ userId }) => {
      const { credits } = await PaymentService.getBalance(Number(userId));
      return { credits };
    },
    {
      response: {
        200: PaymentModel.balanceResponseSchema,
        401: PaymentModel.unauthorizedResponseSchema,
      },
    },
  )
  .post(
    "/onramp",
    async ({ userId }) => {
      const { url } = await PaymentService.createCheckoutSession(
        Number(userId),
      );
      return { url };
    },
    {
      response: {
        200: PaymentModel.checkoutResponseSchema,
        401: PaymentModel.unauthorizedResponseSchema,
      },
    },
  );

export const app = new Elysia().use(webhook).use(authenticated);
