import { prisma } from "db";

type SignInResult =
  | { correctCredentials: false }
  | { correctCredentials: true; userId: string };

export abstract class AuthService {
  static async signUp(email: string, password: string): Promise<string> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = await prisma.user.create({
      data: {
        email: email,
        password: await Bun.password.hash(password),
      },
    });
    return user.id.toString();
  }

  static async signIn(email: string, password: string): Promise<SignInResult> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { correctCredentials: false };
    }

    if (!(await Bun.password.verify(password, user.password))) {
      return { correctCredentials: false };
    }

    return { correctCredentials: true, userId: user.id.toString() };
  }
}
