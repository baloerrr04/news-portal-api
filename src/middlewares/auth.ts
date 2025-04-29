import { Request, Response, NextFunction } from "express";
import { getSession } from "../routes/auth/plu";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: Role;
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
    req.user = {
      id: sessionResult.value.user.id,
      username: sessionResult.value.user.username,
      role: "USER"
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};


export const requireRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
        code: "UNAUTHORIZED"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: `Insufficient privileges. Required roles: ${allowedRoles.join(", ")}`,
        code: "FORBIDDEN"
      });
    }

    next();
  }
}

export const requireAdmin = requireRoles(["ADMIN"]);
export const requireAuth = requireRoles(["USER", "ADMIN"]);

/**
 * Middleware to require admin privileges
 * Usage: server.use('/admin-route', authenticate, requireAdmin, routeHandler);
 */
// export const requireAdmin = (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.user) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({
//       message: "Authentication required",
//     });
//   }

//   if (!req.user.role == "USER") {
//     return res.status(StatusCodes.FORBIDDEN).json({
//       message: "Admin privileges required",
//     });
//   }

//   next();
// };
