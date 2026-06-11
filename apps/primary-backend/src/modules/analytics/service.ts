import { prisma } from "db";

type RequestsPerDayRow = { date: string; count: number };
type TokensPerDayRow = { date: string; input: number; output: number };

export abstract class AnalyticsService {
  static async getAnalytics(userId: number) {
    // Start of the day, 7 days ago (today plus the previous 6 days).
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    // Raw SQL is needed because Prisma cannot GROUP BY a derived DATE() value.
    // The ::int casts keep COUNT/SUM as JS numbers instead of BigInt.
    const requestsPerDay = await prisma.$queryRaw<RequestsPerDayRow[]>`
      SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') AS date,
             COUNT(*)::int AS count
      FROM "Conversation"
      WHERE "userId" = ${userId} AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    const tokensPerDay = await prisma.$queryRaw<TokensPerDayRow[]>`
      SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') AS date,
             COALESCE(SUM("inputTokenCount"), 0)::int AS input,
             COALESCE(SUM("outputTokenCount"), 0)::int AS output
      FROM "Conversation"
      WHERE "userId" = ${userId} AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    const keys = await prisma.apiKey.findMany({
      where: { userId, deleted: false },
      select: { name: true, creditsConsumed: true },
      orderBy: { creditsConsumed: "desc" },
    });

    return {
      requestsPerDay,
      tokensPerDay,
      creditsByKey: keys.map((key) => ({
        name: key.name,
        creditsConsumed: key.creditsConsumed,
      })),
    };
  }
}
