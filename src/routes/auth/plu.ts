import { z } from "zod";
import { LoginAndRegisterDTO } from "./dto";
import { hashPassword, verifyPassword } from "../../lib/auth";
import { db } from "../../lib/db";
import { err, fromPromise, ok } from "neverthrow";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

// Interface for token payload
interface TokenPayload {
  userId: string;
  username: string;
  role: Role;
}

/**
 * Creates a JWT token for the given user
 */
export function createToken(userData: {
  id: string;
  username: string;
  role: Role;
}) {
  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      throw new Error("AUTH_SECRET environment variable is not set");
    }

    const payload: TokenPayload = {
      userId: userData.id,
      username: userData.username,
      role: userData.role,
    };

    // Create token with 24 hour expiration
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    return ok(token);
  } catch (error) {
    console.error("Error creating token:", error);
    return err({
      message: "Failed to create authentication token",
      status: 500,
    });
  }
}

export async function register({
  password,
  username,
}: z.infer<typeof LoginAndRegisterDTO>) {
  const hashPasswordPromise = await fromPromise(
    hashPassword(password),
    (err) => ({
      err,
      message:
        process.env.NODE_ENV === "development"
          ? "Terjadi kesalahan saat meng-hash password"
          : "Internal Server Error",
    })
  );

  if (hashPasswordPromise.isErr()) {
    return err({
      message: hashPasswordPromise.error.message,
      status: 500,
    });
  }

  const userPromise = await fromPromise(
    db.user.create({
      data: {
        username,
        password: hashPasswordPromise.value.hash,
        salt: hashPasswordPromise.value.salt,
      },
    }),
    (err) => ({
      err,
      message: "Terjadi kesalahan saat memasukkan data",
    })
  );

  if (userPromise.isErr()) {
    return err({
      message: userPromise.error.message,
      status: 500,
    });
  }

  return ok(userPromise.value);
}

export async function login({
  password,
  username,
}: z.infer<typeof LoginAndRegisterDTO>) {
  // Find user by username
  const userPromise = await fromPromise(
    db.user.findFirst({
      where: { username },
    }),
    (err) => ({
      err,
      message: "Error fetching user data",
    })
  );

  if (userPromise.isErr()) {
    return err({
      message: userPromise.error.message,
      status: 500,
    });
  }

  const user = userPromise.value;

  // Check if user exists
  if (!user) {
    return err({
      message: "Invalid username or password",
      status: 401,
    });
  }

  // Verify password
  const isPasswordValid = verifyPassword(password, user.password, user.salt);

  if (!isPasswordValid) {
    return err({
      message: "Invalid username or password",
      status: 401,
    });
  }

  // Create JWT token
  const userData = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  const tokenResult = createToken(userData);

  if (tokenResult.isErr()) {
    return err(tokenResult.error);
  }

  return ok({
    user: userData,
    accessToken: tokenResult.value,
  });
}

export async function getSession(accessToken: string) {
  if (!accessToken) {
    return err({
      message: "Token is required",
      status: 401,
    });
  }

  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return err({
        message: "Server configuration error",
        status: 500,
      });
    }

    // Verify and decode the token
    const decoded = jwt.verify(accessToken, secret) as TokenPayload;

    // Get fresh user data from database
    const userPromise = await fromPromise(
      db.user.findUnique({
        where: { id: decoded.userId },
      }),
      (err) => ({
        err,
        message: "Error fetching user data",
      })
    );

    if (userPromise.isErr()) {
      return err({
        message: userPromise.error.message,
        status: 500,
      });
    }

    const user = userPromise.value;

    if (!user) {
      return err({
        message: "User not found",
        status: 404,
      });
    }

    return ok({
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return err({
        message: "Invalid token",
        status: 401,
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      return err({
        message: "Token expired",
        status: 401,
      });
    }

    console.error("Session validation error:", error);
    return err({
      message: "Error validating session",
      status: 500,
    });
  }
}
