import { Request, Response, NextFunction } from "express";
import { getSession } from "../routes/auth/plu";
import { StatusCodes } from "http-status-codes";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

/**
 * Middleware to authenticate requests using JWT from cookies
 * Usage: server.use('/protected-route', authenticate, routeHandler);
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authentication required",
      });
    }

    // Validate token
    const sessionResult = await getSession(token);

    if (sessionResult.isErr()) {
      return res.status(sessionResult.error.status).json({
        message: sessionResult.error.message,
      });
    }

    // Attach user to request
    req.user = sessionResult.value.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to require admin privileges
 * Usage: server.use('/admin-route', authenticate, requireAdmin, routeHandler);
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication required",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Admin privileges required",
    });
  }

  next();
};
