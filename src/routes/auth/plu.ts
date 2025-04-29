import { z } from "zod";
import { LoginAndRegisterDTO } from "./dto";
import { hashPassword, verifyPassword } from "../../lib/auth";
import { db } from "../../lib/db";
import { err, ok, Result } from "neverthrow";
import jwt from "jsonwebtoken";
import { Role, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Types
interface TokenPayload {
  userId: string;
  username: string;
  role: Role;
}

export interface AuthError {
  message: string;
  status: number;
  code?: string;
}

interface AuthResponse {
  user: {
    id: string;
    username: string;
    role: Role;
  };
  accessToken: string;
}

// Constants
const TOKEN_EXPIRY = "24h";
const INVALID_CREDENTIALS_MSG = "Invalid username or password";

/**
 * Creates a JWT token for the given user
 */
function createToken(userData: TokenPayload): Result<string, AuthError> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("AUTH_SECRET is not set");
    return err({
      message: "Server configuration error",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "CONFIG_ERROR"
    });
  }

  try {
    const token = jwt.sign(userData, secret, { expiresIn: TOKEN_EXPIRY });
    return ok(token);
  } catch (error) {
    console.error("Token creation failed:", error);
    return err({
      message: "Authentication failed",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "TOKEN_ERROR"
    });
  }
}

export async function register(
  data: z.infer<typeof LoginAndRegisterDTO>
): Promise<Result<User, AuthError>> {
  try {
    // Hash password
    const hashed = await hashPassword(data.password);
    
    // Create user
    const user = await db.user.create({
      data: {
        username: data.username,
        password: hashed.hash,
        salt: hashed.salt,
        role: "USER" // Default role
      }
    });

    return ok(user);
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return err({
        message: "Username already exists",
        status: StatusCodes.CONFLICT,
        code: "USERNAME_EXISTS"
      });
    }

    return err({
      message: "Registration failed",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "REGISTRATION_ERROR"
    });
  }
}

export async function login(
  data: z.infer<typeof LoginAndRegisterDTO>
): Promise<Result<AuthResponse, AuthError>> {
  try {
    // Find user
    const user = await db.user.findFirst({
      where: { username: data.username }
    });

    if (!user) {
      return err({
        message: INVALID_CREDENTIALS_MSG,
        status: StatusCodes.UNAUTHORIZED,
        code: "USER_NOT_FOUND"
      });
    }

    // Verify password
    const isValid = verifyPassword(data.password, user.password, user.salt);
    if (!isValid) {
      return err({
        message: INVALID_CREDENTIALS_MSG,
        status: StatusCodes.UNAUTHORIZED,
        code: "INVALID_PASSWORD"
      });
    }

    // Create token
    const tokenResult = createToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    if (tokenResult.isErr()) {
      return err(tokenResult.error);
    }

    return ok({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      accessToken: tokenResult.value
    });
  } catch (error) {
    console.error("Login error:", error);
    return err({
      message: "Login failed",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "LOGIN_ERROR"
    });
  }
}

export async function getSession(
  token: string
): Promise<Result<{ user: { id: string; username: string } }, AuthError>> {
  if (!token) {
    return err({
      message: "Authorization required",
      status: StatusCodes.UNAUTHORIZED,
      code: "MISSING_TOKEN"
    });
  }

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true }
    });

    if (!user) {
      return err({
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
        code: "USER_NOT_FOUND"
      });
    }

    return ok({ user });
  } catch (error) {
    console.error("Session validation error:", error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return err({
        message: "Session expired",
        status: StatusCodes.UNAUTHORIZED,
        code: "TOKEN_EXPIRED"
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return err({
        message: "Invalid token",
        status: StatusCodes.UNAUTHORIZED,
        code: "INVALID_TOKEN"
      });
    }

    return err({
      message: "Session validation failed",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      code: "SESSION_ERROR"
    });
  }
}