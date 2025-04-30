import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/shared/errors";

const JWT_SECRET = process.env.JWT_SECRET_KEY!;

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError({ errors: ["Missing or malformed Authorization header"]});
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    throw new UnauthorizedError({ errors: ["Invalid or expired token"] });
  }
};
