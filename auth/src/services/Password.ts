import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(64).toString("hex");
    const derivedHash = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${derivedHash.toString("hex")}.${salt}`;
  }
  static async compare(password: string, storedHashSaltPair: string) {
    const [storedHash, storedSalt] = storedHashSaltPair.split(".");
    const derivedHash = (await scryptAsync(password, storedSalt, 64)) as Buffer;
    return storedHash === derivedHash.toString("hex");
  }
}
