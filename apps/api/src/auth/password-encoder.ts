import { hash, compare } from 'bcrypt';
export class PasswordEncoder {
  private static readonly salt: number = 10;
  static async validatePassword({
    candidateRaw,
    encoded,
  }: {
    candidateRaw: string;
    encoded: string;
  }): Promise<boolean> {
    const isValid = await compare(candidateRaw, encoded);
    return isValid;
  }
  static async hashPassword({
    passwordToHash,
  }: {
    passwordToHash: string;
  }): Promise<string> {
    const hashed = await hash(passwordToHash, this.salt);
    return hashed;
  }
}
