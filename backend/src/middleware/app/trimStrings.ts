import { Request, Response, NextFunction } from 'express';

function normalizeStringsDeep(value: any): any {
  if (typeof value === 'string') {
    return value.trim().replace(/\s+/g, ' ');
  }

  if (Array.isArray(value)) {
    return value.map(normalizeStringsDeep);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, normalizeStringsDeep(val)])
    );
  }

  return value;
}

export const trimStrings = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = normalizeStringsDeep(req.body);
  }
  next();
};
