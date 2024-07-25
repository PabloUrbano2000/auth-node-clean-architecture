import { compareSync, hashSync } from 'bcryptjs'

export class BcryptAdapter {
  static hash(password: string, salt: number = 10): string {
    return hashSync(password, salt)
  }

  static compare(password: string, hashed: string): boolean {
    return compareSync(password, hashed)
  }
}
