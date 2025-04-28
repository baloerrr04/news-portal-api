import { Request, Response, Router } from "express";
import { validateData } from "../../middlewares/validator";
import { LoginAndRegisterDTO } from "./dto";
import { getSession, login, register } from "./plu";
import { StatusCodes } from "http-status-codes";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validateData(LoginAndRegisterDTO),
  async (req: Request, res: Response) => {
    const registerResult = await register(req.body);

    if (registerResult.isErr()) {
      res.status(registerResult.error.status).json({
        message: registerResult.error.message,
      });

      return;
    }

    // Return success but don't expose sensitive data
    res.status(StatusCodes.CREATED).json({
      message: "Registration successful",
      user: {
        id: registerResult.value.id,
        username: registerResult.value.username,
      },
    });

    return;
  }
);

// Login user
authRoutes.post(
  "/login",
  validateData(LoginAndRegisterDTO),
  async (req: Request, res: Response) => {
    const loginResult = await login(req.body);

    if (loginResult.isErr()) {
      res.status(loginResult.error.status).json({
        message: loginResult.error.message,
      });

      return;
    }

    // Set token as HTTP-only cookie
    res.cookie("token", loginResult.value.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      user: loginResult.value.user,
    });
  }
);

// Get current session info
authRoutes.get("/session", async (req: Request, res: Response) => {
  // Get token from cookie or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication required",
    });
    return;
  }

  const sessionResult = await getSession(token);

  if (sessionResult.isErr()) {
    res.status(sessionResult.error.status).json({
      message: sessionResult.error.message,
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    user: sessionResult.value.user,
  });
});
