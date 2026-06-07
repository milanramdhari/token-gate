import { prisma } from "db";

type SignInResult =
  | { correctCredentials: false }
  | { correctCredentials: true; userId: string };

export abstract class AuthService {
  static async signUp(email: string, password: string): Promise<SignInResult> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      return { correctCredentials: false };
    }

    const user = await prisma.user.create({
      data: {
        email: email,
        password: await Bun.password.hash(password),
      },
    });
    return { correctCredentials: true, userId: user.id.toString() };
  }

  static async signIn(email: string, password: string): Promise<SignInResult> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { correctCredentials: false };
    }

    try {
      const valid = await Bun.password.verify(password, user.password);
      if (!valid) {
        return { correctCredentials: false };
      }
    } catch {
      // Stored password isn't a valid Bun hash (e.g. plain text from Prisma Studio)
      return { correctCredentials: false };
    }

    return { correctCredentials: true, userId: user.id.toString() };
  }
}
