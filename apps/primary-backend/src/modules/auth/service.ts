export abstract class AuthService {
  static async signUp(username: string, password: string): Promise<string> {
    return "1234567890";
  }
  static async signIn(username: string, password: string): Promise<string> {
    return "test token";
  }
}