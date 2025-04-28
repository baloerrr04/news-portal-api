import crypto from "crypto";

/**
 * Hashes a password using Node.js crypto module
 * @param password - The password to hash
 * @returns The hashed password and salt
 */
export async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString("hex");

  // Hash the password with the salt using PBKDF2
  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      10000, // Number of iterations
      64, // Key length
      "sha512"
    )
    .toString("hex");

  return { hash, salt };
}

/**
 * Verifies a password against a stored hash and salt
 * @param password - The password to verify
 * @param storedHash - The stored hash
 * @param storedSalt - The stored salt
 * @returns True if the password matches, false otherwise
 */
export function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): boolean {
  // Hash the input password with the stored salt
  const hash = crypto
    .pbkdf2Sync(
      password,
      storedSalt,
      10000, // Same number of iterations as in hashPassword
      64, // Same key length
      "sha512"
    )
    .toString("hex");

  // Compare the generated hash with the stored hash
  return hash === storedHash;
}
