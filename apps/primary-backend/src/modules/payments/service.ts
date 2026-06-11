import Stripe from "stripe";
import { prisma } from "db";

const CREDITS_PER_PACKAGE = 500;
const PRICE_CENTS = 500; // $5.00
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export abstract class PaymentService {
  static async getBalance(userId: number): Promise<{ credits: number }> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    });
    return { credits: user.credits };
  }

  static async createCheckoutSession(
    userId: number,
  ): Promise<{ url: string }> {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${CREDITS_PER_PACKAGE} credits` },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/credits?success=true`,
      cancel_url: `${FRONTEND_URL}/credits`,
      metadata: { userId: userId.toString() },
    });

    await prisma.onrampTransaction.create({
      data: {
        userId,
        amount: CREDITS_PER_PACKAGE,
        status: "pending",
        stripeSessionId: session.id,
      },
    });

    return { url: session.url! };
  }

  static async fulfillCheckout(sessionId: string): Promise<void> {
    const transaction = await prisma.onrampTransaction.findFirst({
      where: { stripeSessionId: sessionId, status: "pending" },
    });

    if (!transaction) return;

    await prisma.$transaction([
      prisma.onrampTransaction.update({
        where: { id: transaction.id },
        data: { status: "completed" },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: { credits: { increment: transaction.amount } },
      }),
    ]);
  }
}
