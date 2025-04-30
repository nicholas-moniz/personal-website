import { Request, Response, NextFunction } from "express";
import xss from "xss";

function sanitizeDeep(value: any): any {
  if (typeof value === "string") {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeDeep);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, sanitizeDeep(val)])
    );
  }

  return value;
}

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeDeep(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeDeep(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeDeep(req.params);
  }
  next();
};