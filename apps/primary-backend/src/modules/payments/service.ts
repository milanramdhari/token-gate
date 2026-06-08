import { prisma } from "db";

const ONRAMP_CREDITS = 100;

export abstract class PaymentService {
  static async getBalance(userId: number): Promise<{ credits: number }> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    });
    return { credits: user.credits };
  }

  static async onramp(userId: number): Promise<{ credits: number }> {
    const [, user] = await prisma.$transaction([
      prisma.onrampTransaction.create({
        data: {
          userId,
          amount: ONRAMP_CREDITS,
          status: "completed",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: ONRAMP_CREDITS } },
        select: { credits: true },
      }),
    ]);

    return { credits: user.credits };
  }
}
