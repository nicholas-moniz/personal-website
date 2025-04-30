import { Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError({ errors: ["User is not authenticated."] });
    }

    const { role } = req.user;

    if (!role) {
      throw new ForbiddenError({ errors: ["User role is missing."] });
    }

    if (!allowedRoles.includes(role)) {
      throw new ForbiddenError({ errors: ["You do not have permission to access this resource."] });
    }

    next();
  };
};
